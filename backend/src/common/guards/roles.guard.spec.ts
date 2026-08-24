import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard, ROLES_KEY } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(() => {
    guard = new RolesGuard(mockReflector as any);
  });

  const createMockExecutionContext = (user: any) => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const context = createMockExecutionContext({ id: 'user-1', role: 'USER' });
      const result = guard.canActivate(context as any);

      expect(result).toBe(true);
    });

    it('should return true when user has required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      const context = createMockExecutionContext({ id: 'user-1', role: 'ADMIN' });
      const result = guard.canActivate(context as any);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user lacks required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      const context = createMockExecutionContext({ id: 'user-1', role: 'USER' });

      expect(() => guard.canActivate(context as any)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      const context = createMockExecutionContext(null);

      expect(() => guard.canActivate(context as any)).toThrow(ForbiddenException);
    });

    it('should allow access when multiple roles are accepted and user has one', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['ADMIN', 'MODERATOR']);

      const context = createMockExecutionContext({ id: 'user-1', role: 'MODERATOR' });
      const result = guard.canActivate(context as any);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException with proper message', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);

      const context = createMockExecutionContext({ id: 'user-1', role: 'USER' });

      try {
        guard.canActivate(context as any);
        fail('Should have thrown ForbiddenException');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toContain('ADMIN');
      }
    });
  });
});
