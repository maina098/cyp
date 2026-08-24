import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ResultsModule } from '../results/results.module';

@Module({
  imports: [ResultsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [ResultsModule],
})
export class AdminModule {}
