import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { PrismaModule } from '../prisma.module';
import { ElectionsModule } from '../elections/elections.module';
import { ResultsModule } from '../results/results.module';

@Module({
  imports: [PrismaModule, ElectionsModule, ResultsModule],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}
