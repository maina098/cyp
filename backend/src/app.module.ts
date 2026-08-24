import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { AdminModule } from './admin/admin.module';
import { ContactModule } from './contact/contact.module';
import { ElectionsModule } from './elections/elections.module';
import { VotesModule } from './votes/votes.module';
import { PositionsModule } from './positions/positions.module';
import { ApplicationsModule } from './applications/applications.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

const appImports = [
  PrismaModule,
  AuthModule,
  ContentModule,
  AdminModule,
  ContactModule,
  ElectionsModule,
  VotesModule,
  PositionsModule,
  ApplicationsModule,
  UsersModule,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting - global configuration
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,    // 1 minute window
        limit: 100,     // 100 requests per minute per IP (global default)
      },
    ]),
    HealthModule,
    ...appImports,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global throttle guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  static imports = appImports;
}
