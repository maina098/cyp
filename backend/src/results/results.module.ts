import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ResultsGateway } from './results.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: Number(process.env.JWT_EXPIRES_IN_SECONDS || 900) },
    }),
  ],
  providers: [ResultsGateway],
  exports: [ResultsGateway],
})
export class ResultsModule {}
