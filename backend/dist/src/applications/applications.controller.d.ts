import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './applications.dto';
export declare class ApplicationsController {
    private applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(dto: CreateApplicationDto, req: any): Promise<{
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
    getUserApplications(req: any): Promise<({
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
    getAll(filters: any): Promise<({
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
    getOne(id: string, req: any): Promise<{
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
    updateStatus(id: string, dto: UpdateApplicationStatusDto, req: any): Promise<{
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
    getByPosition(positionId: string): Promise<({
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
    getStats(electionId: string): Promise<Record<string, number>>;
}
