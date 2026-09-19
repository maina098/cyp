import { Controller, Post, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // 5 login attempts per minute
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    response.cookie('cyp_session', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SAME_SITE === 'none',
      sameSite: process.env.COOKIE_SAME_SITE === 'none' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    response.cookie('cyp_refresh', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SAME_SITE === 'none',
      sameSite: process.env.COOKIE_SAME_SITE === 'none' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    const { access_token: _accessToken, refresh_token: _refreshToken, ...safeResult } = result;
    return safeResult;
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken?: string }, @Res({ passthrough: true }) response: Response) {
    const refreshToken = body.refreshToken || response.req.headers.cookie
      ?.split(';')
      .map((value) => value.trim())
      .find((value) => value.startsWith('cyp_refresh='))
      ?.slice('cyp_refresh='.length);

    const result = await this.authService.refreshAccessToken(refreshToken || '');
    response.cookie('cyp_session', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SAME_SITE === 'none',
      sameSite: process.env.COOKIE_SAME_SITE === 'none' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
    response.cookie('cyp_refresh', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SAME_SITE === 'none',
      sameSite: process.env.COOKIE_SAME_SITE === 'none' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    const { access_token: _accessToken, refresh_token: _refreshToken, ...safeResult } = result;
    return safeResult;
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } }) // 3 registration attempts per minute
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('cyp_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SAME_SITE === 'none',
      sameSite: process.env.COOKIE_SAME_SITE === 'none' ? 'none' : 'lax',
      path: '/',
    });
    response.clearCookie('cyp_refresh', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SAME_SITE === 'none',
      sameSite: process.env.COOKIE_SAME_SITE === 'none' ? 'none' : 'lax',
      path: '/',
    });
  }
}
