import { PrismaService } from '../prisma.service';
export declare class PositionsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(electionId: string): Promise<({
        _count: {
            applications: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        electionId: string;
        isOpen: boolean;
        maxApplicants: number;
    })[]>;
    findOpen(electionId?: string): Promise<({
        _count: {
            applications: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        electionId: string;
        isOpen: boolean;
        maxApplicants: number;
    })[]>;
    findOne(id: string): Promise<({
        applications: ({
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
        })[];
        _count: {
            applications: number;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        electionId: string;
        isOpen: boolean;
        maxApplicants: number;
    }) | null>;
    updateStatus(id: string, isOpen: boolean): Promise<{
        _count: {
            applications: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        electionId: string;
        isOpen: boolean;
        maxApplicants: number;
    }>;
    getPositionStats(electionId: string): Promise<({
        _count: {
            applications: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        electionId: string;
        isOpen: boolean;
        maxApplicants: number;
    })[]>;
}
