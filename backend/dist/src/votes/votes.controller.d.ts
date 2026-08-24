import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { ResultsGateway } from '../results/results.gateway';
export declare class VotesController {
    private votesService;
    private resultsGateway;
    constructor(votesService: VotesService, resultsGateway: ResultsGateway);
    castVote(electionId: string, castVoteDto: CastVoteDto, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserVote(electionId: string, req: any): Promise<{
        id: string;
        electionId: string;
        votedAt: Date;
        voterId: string;
        candidateId: string;
    } | null>;
    getElectionVotes(electionId: string): Promise<{
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
