import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PrismaModule } from '../prisma.module';
import { ElectionsModule } from '../elections/elections.module';
import { ResultsModule } from '../results/results.module';

@Module({
  imports: [PrismaModule, ElectionsModule, ResultsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
