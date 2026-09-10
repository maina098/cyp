import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check endpoint for monitoring' })
  check() {
    const diskPath = process.platform === 'win32' ? 'C:\\' : '/';

    return this.health.check([
      // Check if heap memory is under 150MB
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // Allow normal NestJS, Prisma, and development watcher overhead.
      () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
      // Fail only when more than 99% of the disk is used.
      () => this.disk.checkStorage('disk', { thresholdPercent: 0.99, path: diskPath }),
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch {
          throw new ServiceUnavailableException(
            'Database unavailable. Check the backend DATABASE_URL and Supabase project status.',
          );
        }
      },
    ]);
  }

  @Get('live')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  liveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  readiness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch {
          throw new ServiceUnavailableException(
            'Database unavailable. Check the backend DATABASE_URL and Supabase project status.',
          );
        }
      },
    ]);
  }
}
