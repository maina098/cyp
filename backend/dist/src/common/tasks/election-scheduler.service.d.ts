import { ElectionsService } from '../../elections/elections.service';
import { ElectionOrchestratorService } from '../../elections/election-orchestrator.service';
import { ResultsGateway } from '../../results/results.gateway';
export declare class ElectionSchedulerService {
    private readonly electionsService;
    private readonly electionOrchestrator;
    private readonly resultsGateway;
    constructor(electionsService: ElectionsService, electionOrchestrator: ElectionOrchestratorService, resultsGateway: ResultsGateway);
    syncElectionStatuses(): Promise<void>;
}
