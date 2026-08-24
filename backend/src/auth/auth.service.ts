import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      // Use same error message as wrong password to prevent user enumeration
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      // Log but do not reveal lockout to prevent user enumeration
      this.logger.warn(`Login attempt for locked account: ${loginDto.email}`);
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

      if (lockUntil) {
        this.logger.warn(`Account locked for user ${user.email} due to ${failedAttempts} failed attempts`);
        throw new UnauthorizedException(
          `Account locked due to too many failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
        );
      }

      throw new UnauthorizedException('Invalid credentials');
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

    const payload = { sub: user.id, email: user.email, role: user.role || 'USER' };
    this.logger.log(`User ${user.email} logged in successfully`);
    
    return {
      access_token: this.jwtService.sign(payload),
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
    
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // Create user (default role is USER)
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.username || registerDto.email.split('@')[0],
        passwordHash,
        role: 'USER',
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

    this.logger.log(`User ${user.email} registered successfully`);

    // Generate token
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
