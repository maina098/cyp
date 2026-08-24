import { PrismaService } from '../prisma.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './applications.dto';
import { ResultsGateway } from '../results/results.gateway';
export declare class ApplicationsService {
    private prisma;
    private resultsGateway;
    private readonly logger;
    constructor(prisma: PrismaService, resultsGateway: ResultsGateway);
    create(dto: CreateApplicationDto, userId: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        position: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            electionId: string;
            isOpen: boolean;
            maxApplicants: number;
        };
    } & {
        comments: string | null;
        id: string;
        email: string;
        name: string;
        county: string;
        constituency: string | null;
        updatedAt: Date;
        status: string;
        description: string;
        electionId: string;
        userId: string;
        positionId: string;
        age: number | null;
        reasonForApplying: string | null;
        changeChampion: string | null;
        appliedAt: Date;
    }>;
    findByUser(userId: string): Promise<({
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            title: string;
            description: string | null;
            startsAt: Date;
            endsAt: Date;
            createdBy: string;
        };
        position: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            electionId: string;
            isOpen: boolean;
            maxApplicants: number;
        };
    } & {
        comments: string | null;
        id: string;
        email: string;
        name: string;
        county: string;
        constituency: string | null;
        updatedAt: Date;
        status: string;
        description: string;
        electionId: string;
        userId: string;
        positionId: string;
        age: number | null;
        reasonForApplying: string | null;
        changeChampion: string | null;
        appliedAt: Date;
    })[]>;
    findAll(filters?: {
        electionId?: string;
        positionId?: string;
        status?: string;
        county?: string;
    }): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            title: string;
            description: string | null;
            startsAt: Date;
            endsAt: Date;
            createdBy: string;
        };
        position: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            electionId: string;
            isOpen: boolean;
            maxApplicants: number;
        };
    } & {
        comments: string | null;
        id: string;
        email: string;
        name: string;
        county: string;
        constituency: string | null;
        updatedAt: Date;
        status: string;
        description: string;
        electionId: string;
        userId: string;
        positionId: string;
        age: number | null;
        reasonForApplying: string | null;
        changeChampion: string | null;
        appliedAt: Date;
    })[]>;
    findOne(id: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            title: string;
            description: string | null;
            startsAt: Date;
            endsAt: Date;
            createdBy: string;
        };
        position: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            electionId: string;
            isOpen: boolean;
            maxApplicants: number;
        };
    } & {
        comments: string | null;
        id: string;
        email: string;
        name: string;
        county: string;
        constituency: string | null;
        updatedAt: Date;
        status: string;
        description: string;
        electionId: string;
        userId: string;
        positionId: string;
        age: number | null;
        reasonForApplying: string | null;
        changeChampion: string | null;
        appliedAt: Date;
    }) | null>;
    updateStatus(id: string, dto: UpdateApplicationStatusDto, userId: string, userRole: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        election: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            title: string;
            description: string | null;
            startsAt: Date;
            endsAt: Date;
            createdBy: string;
        };
        position: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            electionId: string;
            isOpen: boolean;
            maxApplicants: number;
        };
    } & {
        comments: string | null;
        id: string;
        email: string;
        name: string;
        county: string;
        constituency: string | null;
        updatedAt: Date;
        status: string;
        description: string;
        electionId: string;
        userId: string;
        positionId: string;
        age: number | null;
        reasonForApplying: string | null;
        changeChampion: string | null;
        appliedAt: Date;
    }>;
    getApplicationStats(electionId: string): Promise<Record<string, number>>;
    findByPosition(positionId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        comments: string | null;
        id: string;
        email: string;
        name: string;
        county: string;
        constituency: string | null;
        updatedAt: Date;
        status: string;
        description: string;
        electionId: string;
        userId: string;
        positionId: string;
        age: number | null;
        reasonForApplying: string | null;
        changeChampion: string | null;
        appliedAt: Date;
    })[]>;
}
