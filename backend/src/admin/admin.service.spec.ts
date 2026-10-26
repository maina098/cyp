import { AdminService } from './admin.service';
import { PrismaService } from '../prisma.service';
import { ResultsGateway } from '../results/results.gateway';
import { AuditService } from '../common/audit.service';

describe('AdminService directory and broadcasts', () => {
  const prisma = {
    leader: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    memberBroadcast: {
      create: jest.fn(),
    },
  } as unknown as PrismaService;
  const resultsGateway = {} as ResultsGateway;
  const auditService = { log: jest.fn() } as unknown as AuditService;
  const service = new AdminService(prisma, resultsGateway, auditService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists leaders by configured order and includes linked member contacts', async () => {
    const leaders = [{ id: 'leader-1', title: 'President', user: { email: 'leader@example.com' } }];
    jest.mocked(prisma.leader.findMany).mockResolvedValue(leaders as never);

    await expect(service.getLeaders()).resolves.toEqual(leaders);
    expect(prisma.leader.findMany).toHaveBeenCalledWith({
      include: { user: { select: { id: true, email: true, phone: true, name: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  });

  it('stores and audits a broadcast for all members', async () => {
    const savedBroadcast = { id: 'broadcast-1', title: 'Meeting', content: 'Join us', type: 'MEMO' };
    jest.mocked(prisma.memberBroadcast.create).mockResolvedValue(savedBroadcast as never);

    await expect(service.createBroadcast({
      title: ' Meeting ',
      content: ' Join us ',
      type: 'MEMO',
    }, 'admin-1')).resolves.toEqual(savedBroadcast);

    expect(prisma.memberBroadcast.create).toHaveBeenCalledWith({
      data: { title: 'Meeting', content: 'Join us', type: 'MEMO', createdById: 'admin-1' },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
    expect(auditService.log).toHaveBeenCalledWith({
      userId: 'admin-1',
      action: 'member_memo_sent',
      details: 'Sent "Meeting" to all members',
    });
  });
});
