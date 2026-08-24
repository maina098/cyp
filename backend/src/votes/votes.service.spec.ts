import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { VotesService } from './votes.service';
import { PrismaService } from '../prisma.service';

describe('VotesService', () => {
  let service: VotesService;
  let prisma: PrismaService;

  const mockElection = {
    id: 'election-123',
    title: 'Test Election',
    status: 'active',
    startsAt: new Date(Date.now() - 1000 * 60 * 60),
    endsAt: new Date(Date.now() + 1000 * 60 * 60),
  };

  const mockCandidate = {
    id: 'candidate-123',
    electionId: 'election-123',
    name: 'Test Candidate',
  };

  const mockPrismaService = {
    election: {
      findUnique: jest.fn(),
    },
    candidate: {
      findUnique: jest.fn(),
    },
    vote: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    electionResult: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    userActivity: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VotesService>(VotesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('castVote', () => {
    it('should cast vote successfully', async () => {
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        const mockTx = {
          election: { findUnique: jest.fn().mockResolvedValue(mockElection) },
          candidate: { findUnique: jest.fn().mockResolvedValue(mockCandidate) },
          vote: { create: jest.fn().mockResolvedValue({ id: 'vote-123' }) },
          electionResult: { upsert: jest.fn().mockResolvedValue({}) },
          userActivity: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(mockTx);
      });
      mockPrismaService.electionResult.findMany.mockResolvedValue([]);

      const result = await service.castVote(
        'election-123',
        { candidateId: 'candidate-123' },
        'user-123',
      );

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException for non-existent election', async () => {
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        const mockTx = {
          election: { findUnique: jest.fn().mockResolvedValue(null) },
          candidate: { findUnique: jest.fn() },
          vote: { create: jest.fn() },
          electionResult: { upsert: jest.fn() },
          userActivity: { create: jest.fn() },
        };
        return fn(mockTx);
      });

      await expect(
        service.castVote('nonexistent', { candidateId: 'candidate-123' }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for inactive election', async () => {
      const inactiveElection = { ...mockElection, status: 'draft' };
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        const mockTx = {
          election: { findUnique: jest.fn().mockResolvedValue(inactiveElection) },
          candidate: { findUnique: jest.fn() },
          vote: { create: jest.fn() },
          electionResult: { upsert: jest.fn() },
          userActivity: { create: jest.fn() },
        };
        return fn(mockTx);
      });

      await expect(
        service.castVote('election-123', { candidateId: 'candidate-123' }, 'user-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException for duplicate vote (P2002 error)', async () => {
      const prismaError = { code: 'P2002' };
      mockPrismaService.$transaction.mockRejectedValue(prismaError);

      await expect(
        service.castVote('election-123', { candidateId: 'candidate-123' }, 'user-123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException for non-existent candidate', async () => {
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        const mockTx = {
          election: { findUnique: jest.fn().mockResolvedValue(mockElection) },
          candidate: { findUnique: jest.fn().mockResolvedValue(null) },
          vote: { create: jest.fn() },
          electionResult: { upsert: jest.fn() },
          userActivity: { create: jest.fn() },
        };
        return fn(mockTx);
      });

      await expect(
        service.castVote('election-123', { candidateId: 'nonexistent' }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for candidate from different election', async () => {
      const wrongElectionCandidate = { ...mockCandidate, electionId: 'different-election' };
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        const mockTx = {
          election: { findUnique: jest.fn().mockResolvedValue(mockElection) },
          candidate: { findUnique: jest.fn().mockResolvedValue(wrongElectionCandidate) },
          vote: { create: jest.fn() },
          electionResult: { upsert: jest.fn() },
          userActivity: { create: jest.fn() },
        };
        return fn(mockTx);
      });

      await expect(
        service.castVote('election-123', { candidateId: 'candidate-123' }, 'user-123'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getUserVote', () => {
    it('should return user vote if exists', async () => {
      const mockVote = {
        id: 'vote-123',
        electionId: 'election-123',
        voterId: 'user-123',
        candidateId: 'candidate-123',
      };
      mockPrismaService.vote.findUnique.mockResolvedValue(mockVote);

      const result = await service.getUserVote('election-123', 'user-123');

      expect(result).toEqual(mockVote);
    });

    it('should return null if vote does not exist', async () => {
      mockPrismaService.vote.findUnique.mockResolvedValue(null);

      const result = await service.getUserVote('election-123', 'user-123');

      expect(result).toBeNull();
    });
  });

  describe('getElectionVotes', () => {
    it('should return paginated votes', async () => {
      const mockVotes = [
        { id: 'vote-1', electionId: 'election-123', candidateId: 'candidate-1', voterId: 'user-1' },
        { id: 'vote-2', electionId: 'election-123', candidateId: 'candidate-2', voterId: 'user-2' },
      ];
      mockPrismaService.vote.findMany.mockResolvedValue(mockVotes);
      mockPrismaService.vote.count.mockResolvedValue(2);

      const result = await service.getElectionVotes('election-123', 1, 10);

      expect(result.data).toEqual(mockVotes);
      expect(result.meta.total).toBe(2);
    });
  });
});
