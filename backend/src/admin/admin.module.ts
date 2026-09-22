import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ResultsModule } from '../results/results.module';
import { AuditService } from '../common/audit.service';

@Module({
  imports: [ResultsModule],
  controllers: [AdminController],
  providers: [AdminService, AuditService],
  exports: [ResultsModule],
})
export class AdminModule {}
