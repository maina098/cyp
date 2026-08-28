import { ApplicationsService } from './applications.service';

describe('ApplicationsService', () => {
  it('accepts applications from five people on five open positions', async () => {
    const prisma = {
      electionPosition: {
        findUnique: jest.fn(async ({ where }: any) => ({
          id: where.id,
          electionId: 'election-1',
          isOpen: true,
          maxApplicants: 100,
        })),
      },
      election: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'election-1',
          status: 'scheduled',
          startsAt: new Date(Date.now() - 60_000),
          endsAt: new Date(Date.now() + 86_400_000),
        }),
      },
      electionApplication: {
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(async ({ data }: any) => ({ id: `application-${data.userId}`, ...data })),
      },
      userActivity: { create: jest.fn().mockResolvedValue({}) },
    } as any;
    const gateway = { broadcastNewApplication: jest.fn() };
    const service = new ApplicationsService(prisma, gateway);

    for (let index = 1; index <= 5; index += 1) {
      await service.create({
        positionId: `position-${index}`,
        electionId: 'election-1',
        name: `Applicant ${index}`,
        email: `applicant${index}@example.com`,
        county: 'Nairobi',
        age: 25,
        description: 'Ready to serve',
        changeChampion: 'Youth participation',
      }, `user-${index}`);
    }

    expect(prisma.electionApplication.create).toHaveBeenCalledTimes(5);
    expect(gateway.broadcastNewApplication).toHaveBeenCalledTimes(5);
    expect(prisma.electionApplication.create.mock.calls.every((call: any[]) => call[0].data.status === 'pending')).toBe(true);
  });
});