import { PrismaService } from '../prisma.service';
import { CastVoteDto } from './dto/cast-vote.dto';
export declare class VotesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    castVote(electionId: string, castVoteDto: CastVoteDto, voterId: string, resultsGateway?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserVote(electionId: string, voterId: string): Promise<{
        id: string;
        electionId: string;
        votedAt: Date;
        voterId: string;
        candidateId: string;
    } | null>;
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
            votedAt: Date;
            voterId: string;
            candidateId: string;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
