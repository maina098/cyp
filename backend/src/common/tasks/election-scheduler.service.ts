import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ElectionsService } from '../../elections/elections.service';
import { ElectionOrchestratorService } from '../../elections/election-orchestrator.service';
import { ResultsGateway } from '../../results/results.gateway';

@Injectable()
export class ElectionSchedulerService {
  constructor(
    private readonly electionsService: ElectionsService,
    private readonly electionOrchestrator: ElectionOrchestratorService,
    private readonly resultsGateway: ResultsGateway,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async syncElectionStatuses() {
    const now = new Date();
    const activatedElections = await this.electionsService.activateDueElections(now);
    for (const election of activatedElections) {
      this.resultsGateway.broadcastStatusChange(election);
    }

    const closedElections = await this.electionsService.findExpiredElections(now);
    for (const election of closedElections) {
      await this.electionOrchestrator.transitionElectionStatus(
        election.id,
        'closed',
        election.createdBy,
      );
    }
  }
}
