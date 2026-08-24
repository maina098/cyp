import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ResultsGateway } from './results.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jkp_secret_key_2026',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [ResultsGateway],
  exports: [ResultsGateway],
})
export class ResultsModule {}
