import { ElectionsService } from './elections.service';
import { ElectionOrchestratorService } from './election-orchestrator.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class ElectionsController {
    private electionsService;
    private electionOrchestrator;
    constructor(electionsService: ElectionsService, electionOrchestrator: ElectionOrchestratorService);
    create(createElectionDto: CreateElectionDto, req: any): Promise<{
        candidates: {
            id: string;
            name: string;
            bio: string | null;
            createdAt: Date;
            electionId: string;
            positionId: string;
            position: number;
            photoUrl: string | null;
        }[];
        positions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            electionId: string;
            isOpen: boolean;
            maxApplicants: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        startsAt: Date;
        endsAt: Date;
        createdBy: string;
    }>;
    findAll(pagination: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResult<any>>;
    findOne(id: string): Promise<{
        _count: {
            votes: number;
            applications: number;
        };
        candidates: {
            id: string;
            name: string;
            bio: string | null;
            _count: {
                votes: number;
            };
            positionId: string;
            position: number;
            photoUrl: string | null;
        }[];
        electionResults: {
            candidateId: string;
            voteCount: number;
        }[];
        positions: {
            id: string;
            title: string;
            _count: {
                applications: number;
            };
            isOpen: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        startsAt: Date;
        endsAt: Date;
        createdBy: string;
    }>;
    update(id: string, updateElectionDto: UpdateElectionDto, req: any): Promise<{
        candidates: {
            id: string;
            name: string;
            bio: string | null;
            createdAt: Date;
            electionId: string;
            positionId: string;
            position: number;
            photoUrl: string | null;
        }[];
        electionResults: {
            id: string;
            updatedAt: Date;
            electionId: string;
            candidateId: string;
            voteCount: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        startsAt: Date;
        endsAt: Date;
        createdBy: string;
    }>;
    updateStatus(id: string, body: {
        status: 'draft' | 'scheduled' | 'active' | 'closed';
    }, req: any): Promise<{
        candidates: {
            id: string;
            name: string;
            bio: string | null;
            createdAt: Date;
            electionId: string;
            positionId: string;
            position: number;
            photoUrl: string | null;
        }[];
        electionResults: {
            id: string;
            updatedAt: Date;
            electionId: string;
            candidateId: string;
            voteCount: number;
        }[];
        positions: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            electionId: string;
            isOpen: boolean;
            maxApplicants: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        startsAt: Date;
        endsAt: Date;
        createdBy: string;
    }>;
    schedule(id: string, body: {
        startsAt?: string;
        endsAt?: string;
    }, req: any): Promise<{
        candidates: {
            id: string;
            name: string;
            bio: string | null;
            createdAt: Date;
            electionId: string;
            positionId: string;
            position: number;
            photoUrl: string | null;
        }[];
        electionResults: {
            id: string;
            updatedAt: Date;
            electionId: string;
            candidateId: string;
            voteCount: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        startsAt: Date;
        endsAt: Date;
        createdBy: string;
    }>;
    delete(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getState(id: string, req: any): Promise<{
        election: {
            id: string;
            title: string;
            status: string;
            startsAt: Date;
            endsAt: Date;
        };
        positions: {
            id: string;
            title: string;
            isOpen: boolean;
            canApply: boolean;
            canVote: boolean;
            myApplicationStatus: string | null;
            hasVoted: boolean;
        }[];
    }>;
    getResults(id: string): Promise<{
        totalVotes: number;
        results: {
            id: string;
            electionId: string;
            candidateId: string;
            voteCount: number;
            percentage: string;
            candidate: {
                id: string;
                name: string;
                positionId: string;
                photoUrl: string | null;
            };
        }[];
    }>;
}
