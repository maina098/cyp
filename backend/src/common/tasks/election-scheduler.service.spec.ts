import { ElectionSchedulerService } from './election-scheduler.service';

describe('ElectionSchedulerService', () => {
  it('closes expired elections through the orchestrator so results are finalized', async () => {
    const electionsService = {
      activateDueElections: jest.fn().mockResolvedValue([]),
      findExpiredElections: jest.fn().mockResolvedValue([
        { id: 'election-1', createdBy: 'creator-1' },
      ]),
    } as any;
    const electionOrchestrator = {
      transitionElectionStatus: jest.fn().mockResolvedValue({
        id: 'election-1',
        status: 'closed',
      }),
    } as any;
    const resultsGateway = {
      broadcastStatusChange: jest.fn(),
    } as any;
    const scheduler = new ElectionSchedulerService(
      electionsService,
      electionOrchestrator,
      resultsGateway,
    );

    await scheduler.syncElectionStatuses();

    expect(electionOrchestrator.transitionElectionStatus).toHaveBeenCalledWith(
      'election-1',
      'closed',
      'creator-1',
    );
    expect(resultsGateway.broadcastStatusChange).not.toHaveBeenCalled();
  });
});
