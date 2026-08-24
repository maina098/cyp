import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ElectionsService } from '../../elections/elections.service';
import { ResultsGateway } from '../../results/results.gateway';

@Injectable()
export class ElectionSchedulerService {
  constructor(
    private readonly electionsService: ElectionsService,
    private readonly resultsGateway: ResultsGateway,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async syncElectionStatuses() {
    const now = new Date();
    await this.electionsService.activateDueElections(now);

    const closedElections = await this.electionsService.closeExpiredElections(now);
    for (const election of closedElections) {
      this.resultsGateway.broadcastStatusChange(election);
    }
  }
}
