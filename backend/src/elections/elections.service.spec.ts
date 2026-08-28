import { ElectionsService } from './elections.service';

describe('ElectionsService', () => {
  it('creates an election with five closed default positions', async () => {
    const created = { id: 'election-1', positions: [] };
    const prisma = {
      election: { create: jest.fn().mockResolvedValue(created) },
    } as any;
    const service = new ElectionsService(prisma);

    const result = await service.create({
      title: 'CYP 2026',
      startsAt: new Date(Date.now() + 86_400_000).toISOString(),
      endsAt: new Date(Date.now() + 172_800_000).toISOString(),
      candidates: [],
    }, 'admin-1');

    expect(result).toEqual(created);
    const createData = prisma.election.create.mock.calls[0][0].data;
    expect(createData.positions.create).toHaveLength(5);
    expect(createData.positions.create.every((position: any) => position.isOpen === false)).toBe(true);
  });

  it('returns sorted result percentages for the results graph', async () => {
    const prisma = {
      electionResult: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'result-1', electionId: 'election-1', candidateId: 'candidate-1', voteCount: 3, candidate: { id: 'candidate-1', name: 'Applicant 1', photoUrl: null } },
          { id: 'result-2', electionId: 'election-1', candidateId: 'candidate-2', voteCount: 2, candidate: { id: 'candidate-2', name: 'Applicant 2', photoUrl: null } },
        ]),
      },
    } as any;
    const service = new ElectionsService(prisma);

    const result = await service.getResults('election-1');

    expect(result.totalVotes).toBe(5);
    expect(result.results.map((item) => item.percentage)).toEqual(['60.00', '40.00']);
  });
});