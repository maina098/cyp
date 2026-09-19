import { Injectable, UnauthorizedException, ConflictException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from './email.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const EMAIL_VERIFICATION_HOURS = 24;
const PASSWORD_RESET_MINUTES = 30;
const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 900);
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
const DUMMY_PASSWORD_HASH = '$2b$12$7QJ8Q3x5q9Gf8f3mQq6xUu8nYp2sJ5Lr9vT2xK4mN6pR8sC1dE3fG';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto) {
    const email = this.normalizeEmail(loginDto.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await bcrypt.compare(loginDto.password, DUMMY_PASSWORD_HASH);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      this.logger.warn(`Login attempt for locked account: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = (user.failedAttempts || 0) + 1;
      const lockUntil = failedAttempts >= MAX_FAILED_ATTEMPTS 
        ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
        : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts,
          lockedUntil: lockUntil,
        },
      });

      if (lockUntil) this.logger.warn(`Account lockout triggered for ${user.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Please verify your email before signing in');
    }

    // Reset failed attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    // Track user activity
    await this.prisma.userActivity.create({
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        action: 'login',
        details: `User logged in at ${new Date().toISOString()}`,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role || 'USER', ver: user.sessionVersion };
    this.logger.log(`User ${user.email} logged in successfully`);
    const accessToken = this.jwtService.sign(payload, { expiresIn: `${ACCESS_TOKEN_TTL_SECONDS}s` });
    const refreshToken = await this.createRefreshToken(user.id);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'USER',
      },
    };
  }

  async register(registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for ${registerDto.email}`);
    
    const email = this.normalizeEmail(registerDto.email);
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    const verificationToken = this.createToken();

    // Create user (default role is USER)
    const user = await this.prisma.user.create({
      data: {
        email,
        name: registerDto.username || email.split('@')[0],
        passwordHash,
        role: 'USER',
        emailVerificationTokenHash: this.hashToken(verificationToken),
        emailVerificationExpiresAt: new Date(Date.now() + EMAIL_VERIFICATION_HOURS * 60 * 60 * 1000),
      },
    });

    // Track user registration
    await this.prisma.userActivity.create({
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        action: 'register',
        details: `User registered at ${new Date().toISOString()}`,
      },
    });

    try {
      await this.emailService.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      this.logger.error(`Unable to send verification email to ${user.email}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Registration could not be completed. Please try again later.');
    }

    this.logger.log(`User ${user.email} registered; verification required`);
    return {
      message: 'Registration successful. Check your email to verify your account.',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationTokenHash: this.hashToken(token),
        emailVerificationExpiresAt: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Verification link is invalid or expired');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), emailVerificationTokenHash: null, emailVerificationExpiresAt: null },
    });
    return { message: 'Email verified successfully. You can now sign in.' };
  }

  async requestPasswordReset(emailInput: string) {
    const email = this.normalizeEmail(emailInput);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = this.createToken();
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: this.hashToken(token),
          passwordResetExpiresAt: new Date(Date.now() + PASSWORD_RESET_MINUTES * 60 * 1000),
        },
      });
      try {
        await this.emailService.sendPasswordResetEmail(user.email, token);
      } catch (error) {
        this.logger.error(`Unable to send password reset email to ${user.email}`, error instanceof Error ? error.stack : undefined);
      }
    }
    return { message: 'If an account exists for that email, password reset instructions have been sent.' };
  }

  async resetPassword(token: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: this.hashToken(token),
        passwordResetExpiresAt: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Password reset link is invalid or expired');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(password, 12),
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        failedAttempts: 0,
        lockedUntil: null,
        sessionVersion: { increment: 1 },
      },
    });
    return { message: 'Password reset successfully. You can now sign in.' };
  }

  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshTokenHash = this.hashToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: refreshTokenHash },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    const payload = { sub: user.id, email: user.email, role: user.role || 'USER', ver: user.sessionVersion };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: `${ACCESS_TOKEN_TTL_SECONDS}s` });
    const rotatedRefreshToken = await this.rotateRefreshToken(storedToken.id, user.id);

    return {
      access_token: newAccessToken,
      refresh_token: rotatedRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'USER',
      },
    };
  }

  async revokeRefreshToken(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: {
          userId,
          tokenHash: this.hashToken(refreshToken),
        },
        data: { revokedAt: new Date() },
      });
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async createRefreshToken(userId: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(token),
        expiresAt,
      },
    });

    return token;
  }

  private async rotateRefreshToken(existingTokenId: string, userId: string) {
    await this.prisma.refreshToken.update({
      where: { id: existingTokenId },
      data: { revokedAt: new Date() },
    });

    return this.createRefreshToken(userId);
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private createToken() {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
