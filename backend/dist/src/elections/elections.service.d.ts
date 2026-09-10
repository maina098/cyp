import { PrismaService } from '../prisma.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { PaginationDto, PaginatedResult } from '../common/dto/pagination.dto';
export declare class ElectionsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(createElectionDto: CreateElectionDto, userId: string): Promise<{
        candidates: {
            id: string;
            name: string;
            bio: string | null;
            createdAt: Date;
            electionId: string;
            positionId: string | null;
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
    findAll(pagination?: PaginationDto): Promise<PaginatedResult<any>>;
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
            positionId: string | null;
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
    update(id: string, updateElectionDto: UpdateElectionDto, userId: string, userRole?: string): Promise<{
        candidates: {
            id: string;
            name: string;
            bio: string | null;
            createdAt: Date;
            electionId: string;
            positionId: string | null;
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
    updateStatus(id: string, status: 'draft' | 'scheduled' | 'active' | 'closed', userId: string, userRole?: string): Promise<{
        candidates: {
            id: string;
            name: string;
            bio: string | null;
            createdAt: Date;
            electionId: string;
            positionId: string | null;
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
    scheduleElection(id: string, payload: {
        startsAt?: string;
        endsAt?: string;
    }, userId: string, userRole?: string): Promise<{
        candidates: {
            id: string;
            name: string;
            bio: string | null;
            createdAt: Date;
            electionId: string;
            positionId: string | null;
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
    delete(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getResults(electionId: string): Promise<{
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
                positionId: string | null;
                photoUrl: string | null;
            };
        }[];
    }>;
    activateDueElections(now: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        startsAt: Date;
        endsAt: Date;
        createdBy: string;
    }[]>;
    closeExpiredElections(now: Date): Promise<{
        id: string;
        status: string;
    }[]>;
}
