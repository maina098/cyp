import { ElectionsService } from '../../elections/elections.service';
import { ResultsGateway } from '../../results/results.gateway';
export declare class ElectionSchedulerService {
    private readonly electionsService;
    private readonly resultsGateway;
    constructor(electionsService: ElectionsService, resultsGateway: ResultsGateway);
    syncElectionStatuses(): Promise<void>;
}
