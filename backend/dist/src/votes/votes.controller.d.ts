import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { ResultsGateway } from '../results/results.gateway';
declare class VerifyOtpDto {
    otpId: string;
    otpCode: string;
}
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
        positionId: string;
        votedAt: Date;
        candidateId: string;
        voterId: string;
    }[]>;
    requestVotingOtp(electionId: string, req: any): Promise<{
        otpId: string;
        expiresAt: Date;
        message: string;
    }>;
    verifyVotingOtp(electionId: string, body: VerifyOtpDto, req: any): Promise<{
        valid: boolean;
        otpId: string;
        expiresAt: Date;
        message: string;
    }>;
    createVotingSession(electionId: string, body: {
        otpId: string;
    }, req: any): Promise<{
        sessionId: string;
        expiresAt: Date;
        message: string;
    }>;
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
export {};
