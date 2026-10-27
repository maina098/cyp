import { BadRequestException, ConflictException } from '@nestjs/common';
import { ApplicationsService } from '../applications/applications.service';
import { VotesService } from '../votes/votes.service';
import { EmailService } from '../auth/email.service';
import { ElectionsService } from './elections.service';
import { ResultsGateway } from '../results/results.gateway';

describe('Election application-to-results flow', () => {
  it('submits applications, approves candidates, casts per-position votes, broadcasts updates, and returns results', async () => {
    const electionId = 'election-1';
    const userId = 'voter-1';
    const election = {
      id: electionId,
      title: 'CYP Test Election',
      status: 'active',
      startsAt: new Date(Date.now() - 60_000),
      endsAt: new Date(Date.now() + 60_000),
      createdBy: 'admin-1',
    };
    const positions = [
      { id: 'position-1', electionId, title: 'Governor', isOpen: true, maxApplicants: 10, createdAt: new Date(1) },
      { id: 'position-2', electionId, title: 'Secretary', isOpen: true, maxApplicants: 10, createdAt: new Date(2) },
    ];
    const applications: any[] = [];
    const candidates: any[] = [];
    const votes: any[] = [];
    const results: any[] = [];
    const otps: any[] = [];
    const sessions: any[] = [];
    const emitted: Array<{ room: string; event: string; payload: any }> = [];
    let deliveredOtp = '';
    const gateway = new ResultsGateway({} as any, {} as any);
    gateway.server = {
      to: (room: string) => ({
        emit: (event: string, payload: any) => emitted.push({ room, event, payload }),
      }),
    } as any;

    const createResultSnapshot = () =>
      results
        .map((result) => ({
          ...result,
          candidate: candidates.find((candidate) => candidate.id === result.candidateId),
        }))
        .sort((left, right) => right.voteCount - left.voteCount);

    const prisma: any = {
      election: {
        findUnique: jest.fn().mockResolvedValue(election),
      },
      electionPosition: {
        findUnique: jest.fn(async ({ where }: any) => positions.find((position) => position.id === where.id) ?? null),
        findFirst: jest.fn(async ({ where }: any) => positions.find((position) =>
          position.id === where.id && position.electionId === where.electionId,
        ) ?? null),
      },
      electionApplication: {
        findUnique: jest.fn(async ({ where }: any) => {
          if (where.id) {
            const application = applications.find((item) => item.id === where.id);
            return application ? { ...application, election } : null;
          }
          return applications.find((application) =>
            application.positionId === where.positionId_userId.positionId &&
            application.userId === where.positionId_userId.userId,
          ) ?? null;
        }),
        count: jest.fn(async ({ where }: any) =>
          applications.filter((application) => application.positionId === where.positionId).length,
        ),
        create: jest.fn(async ({ data }: any) => {
          const application = {
            id: `application-${applications.length + 1}`,
            ...data,
            position: positions.find((position) => position.id === data.positionId),
            election,
          };
          applications.push(application);
          return application;
        }),
      },
      userActivity: {
        create: jest.fn().mockResolvedValue({}),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: userId,
          email: 'voter@example.test',
          name: 'Test Voter',
        }),
      },
      voteOtp: {
        create: jest.fn(async ({ data }: any) => {
          const otp = { id: 'otp-1', ...data, usedAt: null };
          otps.push(otp);
          return otp;
        }),
        findFirst: jest.fn(async ({ where }: any) => otps.find((otp) =>
          otp.id === where.id &&
          otp.electionId === where.electionId &&
          otp.userId === where.userId &&
          (where.usedAt === undefined || otp.usedAt === where.usedAt),
        ) ?? null),
        findUnique: jest.fn(async ({ where }: any) => otps.find((otp) => otp.id === where.id) ?? null),
        update: jest.fn(async ({ where, data }: any) => {
          const otp = otps.find((item) => item.id === where.id);
          Object.assign(otp, data);
          return otp;
        }),
      },
      votingSession: {
        create: jest.fn(async ({ data }: any) => {
          const session = { id: `session-${sessions.length + 1}`, completedAt: null, ...data };
          sessions.push(session);
          return session;
        }),
      },
      candidate: {
        findFirst: jest.fn(async ({ where }: any) => candidates.find((candidate) =>
          candidate.electionId === where.electionId &&
          candidate.positionId === where.positionId &&
          (!where.name || candidate.name === where.name),
        ) ?? null),
      },
      vote: {
        create: jest.fn(async ({ data }: any) => {
          if (votes.some((vote) =>
            vote.electionId === data.electionId &&
            vote.positionId === data.positionId &&
            vote.voterId === data.voterId,
          )) {
            throw { code: 'P2002' };
          }
          const vote = { id: `vote-${votes.length + 1}`, ...data };
          votes.push(vote);
          return vote;
        }),
      },
      electionResult: {
        upsert: jest.fn(async ({ where, update, create }: any) => {
          let result = results.find((item) =>
            item.electionId === where.electionId_candidateId.electionId &&
            item.candidateId === where.electionId_candidateId.candidateId,
          );
          if (result) {
            result.voteCount += update.voteCount.increment;
          } else {
            result = { id: `result-${results.length + 1}`, ...create };
            results.push(result);
          }
          return result;
        }),
        findMany: jest.fn(async () => createResultSnapshot()),
      },
      $transaction: jest.fn(),
    };

    prisma.$transaction.mockImplementation(async (callback: (tx: any) => Promise<any>) =>
      callback({
        electionApplication: {
          update: jest.fn(async ({ where, data }: any) => {
            const application = applications.find((item) => item.id === where.id);
            Object.assign(application, data);
            return application;
          }),
        },
        electionPosition: {
          findMany: jest.fn(async () => positions),
          findFirst: prisma.electionPosition.findFirst,
        },
        candidate: {
          findFirst: jest.fn(async ({ where }: any) => {
            const candidate = candidates.find((item) =>
              item.electionId === where.electionId &&
              item.positionId === where.positionId &&
              (!where.name || item.name === where.name),
            );
            return candidate ? { ...candidate, _count: { votes: 0 } } : null;
          }),
          create: jest.fn(async ({ data }: any) => {
            const candidate = { id: `candidate-${candidates.length + 1}`, ...data };
            candidates.push(candidate);
            return candidate;
          }),
        },
        voteOtp: {
          findUnique: prisma.voteOtp.findUnique,
          update: prisma.voteOtp.update,
        },
        votingSession: {
          create: prisma.votingSession.create,
          findFirst: jest.fn(async ({ where }: any) => sessions.find((session) =>
            session.id === where.id &&
            session.electionId === where.electionId &&
            session.userId === where.userId &&
            session.completedAt === where.completedAt,
          ) ?? null),
        },
        vote: { create: prisma.vote.create },
        electionResult: { upsert: prisma.electionResult.upsert },
        userActivity: { create: jest.fn().mockResolvedValue({}) },
        user: {
          findUnique: jest.fn().mockResolvedValue({
            id: userId,
            email: 'voter@example.test',
            name: 'Test Voter',
          }),
        },
        election: { findUnique: jest.fn().mockResolvedValue(election) },
      }),
    );

    const applicationsService = new ApplicationsService(prisma, gateway);
    const emailService = {
      sendVotingOtpEmail: jest.fn(async (_email: string, code: string) => {
        deliveredOtp = code;
      }),
    } as unknown as EmailService;
    const votesService = new VotesService(prisma, emailService);
    const electionsService = new ElectionsService(prisma);

    for (const [index, position] of positions.entries()) {
      const application = await applicationsService.create({
        positionId: position.id,
        electionId,
        name: `Candidate ${index + 1}`,
        email: `candidate${index + 1}@example.test`,
        county: 'Mombasa',
        age: 25,
        description: 'Ready to serve the community',
        changeChampion: 'Improve youth participation',
      }, `applicant-${index + 1}`);
      expect(application.status).toBe('pending');
      await applicationsService.updateStatus(application.id, { status: 'approved' }, 'admin-1', 'ADMIN');
    }

    expect(candidates).toHaveLength(2);
    expect(emitted.filter((event) => event.event === 'newApplication')).toHaveLength(2);
    expect(emitted.filter((event) => event.event === 'applicationStatusUpdate')).toHaveLength(2);

    const otp = await votesService.requestVotingOtp(electionId, userId);
    expect(deliveredOtp).toMatch(/^\d{6}$/);
    await expect(
      votesService.verifyVotingOtp(electionId, userId, otp.otpId, deliveredOtp),
    ).resolves.toMatchObject({ valid: true });
    const session = await votesService.createVotingSession(electionId, userId, otp.otpId);
    expect(otps[0].usedAt).toBeInstanceOf(Date);
    await expect(
      votesService.createVotingSession(electionId, userId, otp.otpId),
    ).rejects.toThrow(BadRequestException);

    for (const candidate of candidates) {
      await expect(
        votesService.castVote(
          electionId,
          { candidateId: candidate.id, positionId: candidate.positionId, sessionId: session.sessionId },
          userId,
          gateway,
        ),
      ).resolves.toMatchObject({ success: true });
    }

    await expect(
      votesService.castVote(
        electionId,
        {
          candidateId: candidates[0].id,
          positionId: candidates[0].positionId,
          sessionId: session.sessionId,
        },
        userId,
        gateway,
      ),
    ).rejects.toThrow(ConflictException);

    const liveUpdates = emitted.filter((event) =>
      event.room === `election:${electionId}` && event.event === 'resultsUpdate',
    );
    expect(liveUpdates).toHaveLength(2);
    expect(liveUpdates[1].payload.results).toHaveLength(2);

    const finalResults = await electionsService.getResults(electionId);
    expect(finalResults.totalVotes).toBe(2);
    expect(finalResults.results.map((result) => result.voteCount)).toEqual([1, 1]);
    expect(finalResults.results.map((result) => result.percentage)).toEqual(['50.00', '50.00']);

    await expect(
      applicationsService.create({
        positionId: 'position-from-another-election',
        electionId,
        name: 'Invalid Candidate',
        email: 'invalid@example.test',
        county: 'Mombasa',
        age: 25,
        description: 'Ready to serve the community',
        changeChampion: 'Improve youth participation',
      }, 'invalid-applicant'),
    ).rejects.toThrow(BadRequestException);
  });
});
