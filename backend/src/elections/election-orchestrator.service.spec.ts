import { ElectionOrchestratorService } from './election-orchestrator.service';

describe('ElectionOrchestratorService', () => {
  it('rejects candidates assigned to a position from another election', async () => {
    const prisma = {
      election: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'election-1',
          createdBy: 'owner-1',
          status: 'draft',
        }),
      },
      electionPosition: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      candidate: {
        create: jest.fn(),
      },
    } as any;
    const service = new ElectionOrchestratorService(prisma, {} as any);

    await expect(
      service.addCandidate(
        'election-1',
        { name: 'Candidate', positionId: 'position-from-another-election' },
        'owner-1',
      ),
    ).rejects.toThrow('Position does not belong to this election');
    expect(prisma.candidate.create).not.toHaveBeenCalled();
  });

  it('creates missing default positions when initializing an election', async () => {
    const createdPositions: any[] = [];
    const prisma = {
      election: {
        findUnique: jest.fn()
          .mockResolvedValueOnce({ id: 'election-1', createdBy: 'owner-1' })
          .mockResolvedValueOnce({ id: 'election-1', positions: createdPositions }),
      },
      electionPosition: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(async ({ data }: any) => {
          createdPositions.push(data);
          return data;
        }),
      },
    } as any;
    const service = new ElectionOrchestratorService(prisma, {} as any);

    await service.initializeElectionWithPositions('election-1', 'owner-1');

    expect(prisma.electionPosition.create).toHaveBeenCalledTimes(5);
    expect(createdPositions.every((position) => position.isOpen === false)).toBe(true);
  });

  it('allows an admin to transition another user election without opening positions', async () => {
    const election = {
      id: 'election-1',
      createdBy: 'owner-1',
      status: 'draft',
      positions: [{ id: 'position-1', isOpen: false }],
      applications: [],
    };
    const updated = { ...election, status: 'scheduled' };
    const prisma = {
      election: { findUnique: jest.fn().mockResolvedValue(election) },
      $transaction: jest.fn().mockImplementation(async (callback) => callback({
        election: { update: jest.fn().mockResolvedValue(updated) },
        electionPosition: { updateMany: jest.fn() },
      })),
    } as any;
    const gateway = { broadcastStatusChange: jest.fn() } as any;
    const service = new ElectionOrchestratorService(prisma, gateway);

    await service.transitionElectionStatus('election-1', 'scheduled', 'admin-1', 'ADMIN');

    expect(gateway.broadcastStatusChange).toHaveBeenCalledWith(updated);
    expect(prisma.$transaction.mock.calls[0][0]).toBeDefined();
  });

  it('closes positions and snapshots winners and ties when an election closes', async () => {
    const election = {
      id: 'election-1',
      createdBy: 'owner-1',
      status: 'active',
      positions: [],
      applications: [],
    };
    const updated = { ...election, status: 'closed' };
    const positionResultUpsert = jest.fn().mockResolvedValue({});
    const prisma = {
      election: { findUnique: jest.fn().mockResolvedValue(election) },
      $transaction: jest.fn().mockImplementation(async (callback) => callback({
        electionPosition: {
          updateMany: jest.fn().mockResolvedValue({ count: 2 }),
          findMany: jest.fn().mockResolvedValue([
            { id: 'position-winner' },
            { id: 'position-tie' },
          ]),
        },
        vote: {
          groupBy: jest.fn(async ({ where }: any) => where.positionId === 'position-winner'
            ? [
                { candidateId: 'candidate-winner', _count: { _all: 3 } },
                { candidateId: 'candidate-second', _count: { _all: 1 } },
              ]
            : [
                { candidateId: 'candidate-tie-a', _count: { _all: 2 } },
                { candidateId: 'candidate-tie-b', _count: { _all: 2 } },
              ]),
        },
        positionResult: { upsert: positionResultUpsert },
        election: { update: jest.fn().mockResolvedValue(updated) },
      })),
    } as any;
    const gateway = { broadcastStatusChange: jest.fn() } as any;
    const service = new ElectionOrchestratorService(prisma, gateway);

    await service.transitionElectionStatus('election-1', 'closed', 'owner-1');

    expect(positionResultUpsert).toHaveBeenCalledTimes(2);
    expect(positionResultUpsert.mock.calls[0][0].create).toMatchObject({
      candidateId: 'candidate-winner',
      totalVotes: 4,
      isTie: false,
    });
    expect(positionResultUpsert.mock.calls[1][0].create).toMatchObject({
      candidateId: null,
      totalVotes: 4,
      isTie: true,
    });
    expect(gateway.broadcastStatusChange).toHaveBeenCalledWith(updated);
  });

  it('requires the election to be active before opening positions for applications', async () => {
    const prisma = {
      election: {
        findUnique: jest.fn().mockResolvedValue({ id: 'election-1', status: 'draft', createdBy: 'owner-1' }),
      },
    } as any;
    const service = new ElectionOrchestratorService(prisma, {} as any);

    await expect(service.openPositionsForApplications('election-1', ['position-1'], 'owner-1', 'ADMIN')).rejects.toThrow(
      'Election must be active before positions can open for applications or voting.',
    );
  });

  it('approves five applicants and assigns each candidate to its position ordinal', async () => {
    const gateway = { broadcastApplicationStatusUpdate: jest.fn() } as any;
    const createdCandidates: any[] = [];
    const prisma = {
      electionApplication: {
        findUnique: jest.fn(async ({ where }: any) => ({
          id: where.id,
          electionId: 'election-1',
          positionId: `position-${where.id.replace('application-', '')}`,
          name: `Applicant ${where.id.replace('application-', '')}`,
          email: `${where.id}@example.com`,
          description: 'Application',
          election: { createdBy: 'owner-1' },
          position: { title: 'Position' },
        })),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => callback({
        electionApplication: { update: jest.fn(async ({ where, data }: any) => ({
          id: where.id,
          ...data,
          position: { title: 'Position' },
          election: { id: 'election-1' },
        })) },
        electionPosition: {
          findMany: jest.fn().mockResolvedValue([
            { id: 'position-1' },
            { id: 'position-2' },
            { id: 'position-3' },
            { id: 'position-4' },
            { id: 'position-5' },
          ]),
        },
        candidate: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn(async ({ data }: any) => {
            createdCandidates.push(data);
            return { id: `candidate-${createdCandidates.length}`, ...data };
          }),
        },
        userActivity: { create: jest.fn().mockResolvedValue({}) },
      })),
    } as any;
    const service = new ElectionOrchestratorService(prisma, gateway);

    for (let index = 1; index <= 5; index += 1) {
      await service.approveApplicationAndCreateCandidate(`application-${index}`, 'election-1', 'admin-1', 'ADMIN');
    }

    expect(createdCandidates).toHaveLength(5);
    expect(createdCandidates.map((candidate) => candidate.position)).toEqual([1, 2, 3, 4, 5]);
    expect(gateway.broadcastApplicationStatusUpdate).toHaveBeenCalledTimes(5);
  });
});