"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const email_service_1 = require("./email.service");
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const EMAIL_VERIFICATION_HOURS = 24;
const PASSWORD_RESET_MINUTES = 30;
const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL_SECONDS || 900);
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
const DUMMY_PASSWORD_HASH = '$2b$12$7QJ8Q3x5q9Gf8f3mQq6xUu8nYp2sJ5Lr9vT2xK4mN6pR8sC1dE3fG';
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    emailService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async login(loginDto) {
        const email = this.normalizeEmail(loginDto.email);
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            await bcrypt.compare(loginDto.password, DUMMY_PASSWORD_HASH);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            this.logger.warn(`Login attempt for locked account: ${email}`);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
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
            if (lockUntil)
                this.logger.warn(`Account lockout triggered for ${user.email}`);
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.emailVerifiedAt) {
            throw new common_1.UnauthorizedException('Please verify your email before signing in');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                failedAttempts: 0,
                lockedUntil: null,
            },
        });
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
    async register(registerDto) {
        this.logger.log(`Registration attempt for ${registerDto.email}`);
        const email = this.normalizeEmail(registerDto.email);
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(registerDto.password, 12);
        const verificationToken = this.createToken();
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
        }
        catch (error) {
            this.logger.error(`Unable to send verification email to ${user.email}`, error instanceof Error ? error.stack : undefined);
            throw new common_1.InternalServerErrorException('Registration could not be completed. Please try again later.');
        }
        this.logger.log(`User ${user.email} registered; verification required`);
        return {
            message: 'Registration successful. Check your email to verify your account.',
        };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: {
                emailVerificationTokenHash: this.hashToken(token),
                emailVerificationExpiresAt: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException('Verification link is invalid or expired');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerifiedAt: new Date(), emailVerificationTokenHash: null, emailVerificationExpiresAt: null },
        });
        return { message: 'Email verified successfully. You can now sign in.' };
    }
    async requestPasswordReset(emailInput) {
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
            }
            catch (error) {
                this.logger.error(`Unable to send password reset email to ${user.email}`, error instanceof Error ? error.stack : undefined);
            }
        }
        return { message: 'If an account exists for that email, password reset instructions have been sent.' };
    }
    async resetPassword(token, password) {
        const user = await this.prisma.user.findFirst({
            where: {
                passwordResetTokenHash: this.hashToken(token),
                passwordResetExpiresAt: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException('Password reset link is invalid or expired');
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
    async refreshAccessToken(refreshToken) {
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token is required');
        }
        const refreshTokenHash = this.hashToken(refreshToken);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash: refreshTokenHash },
        });
        if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
            throw new common_1.UnauthorizedException('Refresh token is invalid or expired');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: storedToken.userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User no longer exists');
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
    async revokeRefreshToken(userId, refreshToken) {
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
    async createRefreshToken(userId) {
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
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
    async rotateRefreshToken(existingTokenId, userId) {
        await this.prisma.refreshToken.update({
            where: { id: existingTokenId },
            data: { revokedAt: new Date() },
        });
        return this.createRefreshToken(userId);
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    createToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map