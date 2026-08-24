import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';
import { ElectionOrchestratorService } from './election-orchestrator.service';
import { ElectionOrchestratorController } from './election-orchestrator.controller';
import { PrismaModule } from '../prisma.module';
import { ResultsModule } from '../results/results.module';
import { ElectionSchedulerService } from '../common/tasks/election-scheduler.service';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), ResultsModule],
  controllers: [ElectionsController, ElectionOrchestratorController],
  providers: [
    ElectionsService,
    ElectionOrchestratorService,
    ElectionSchedulerService,
  ],
  exports: [
    ElectionsService,
    ElectionOrchestratorService,
    ResultsModule,
  ],
})
export class ElectionsModule {}
