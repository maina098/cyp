import { PrismaService } from '../prisma.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { EmailService } from '../auth/email.service';
export declare class VotesService {
    private prisma;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    castVote(electionId: string, castVoteDto: CastVoteDto, voterId: string, resultsGateway?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    requestVotingOtp(electionId: string, userId: string): Promise<{
        otpId: string;
        expiresAt: Date;
        message: string;
    }>;
    verifyVotingOtp(electionId: string, userId: string, otpId: string, otpCode: string): Promise<{
        valid: boolean;
        otpId: string;
        expiresAt: Date;
        message: string;
    }>;
    createVotingSession(electionId: string, userId: string, otpId: string): Promise<{
        sessionId: string;
        expiresAt: Date;
        message: string;
    }>;
    validateVotingSession(electionId: string, userId: string, sessionId: string): Promise<{
        valid: boolean;
        sessionId: string;
        expiresAt: Date;
    }>;
    private hashOptCode;
    getUserVote(electionId: string, voterId: string): Promise<{
        id: string;
        electionId: string;
        positionId: string;
        votedAt: Date;
        candidateId: string;
        voterId: string;
    }[]>;
    getElectionVotes(electionId: string, page?: number, limit?: number): Promise<{
        data: ({
            candidate: {
                id: string;
                name: string;
            };
            voter: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            electionId: string;
            positionId: string;
            votedAt: Date;
            candidateId: string;
            voterId: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
