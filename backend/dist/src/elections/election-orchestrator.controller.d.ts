import { ElectionOrchestratorService } from './election-orchestrator.service';
export declare class ElectionOrchestratorController {
    private orchestrator;
    constructor(orchestrator: ElectionOrchestratorService);
    initializeElection(electionId: string, req: any): Promise<({
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
    }) | null>;
    transitionStatus(electionId: string, body: {
        status: 'draft' | 'scheduled' | 'active' | 'closed';
    }, req: any): Promise<{
        candidates: {
            id: string;
            name: string;
            bio: string | null;
            createdAt: Date;
            electionId: string;
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
    openPositions(electionId: string, body: {
        positionIds: string[];
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        electionId: string;
        isOpen: boolean;
        maxApplicants: number;
    }[]>;
    closePositions(electionId: string, body: {
        positionIds: string[];
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        electionId: string;
        isOpen: boolean;
        maxApplicants: number;
    }[]>;
    getDashboardStats(electionId: string): Promise<{
        electionId: string;
        title: string;
        status: string;
        startsAt: Date;
        endsAt: Date;
        totalCandidates: number;
        totalApplications: number;
        totalVotes: number;
        positions: {
            id: string;
            title: string;
            isOpen: boolean;
            applicationCount: number;
            maxApplicants: number;
        }[];
        applicationsByStatus: {
            pending: number;
            approved: number;
            rejected: number;
            withdrawn: number;
        };
    }>;
    getTimeline(electionId: string): Promise<{
        electionId: string;
        title: string;
        status: string;
        currentPhase: string;
        schedule: {
            startsAt: Date;
            endsAt: Date;
            daysUntilStart: number;
            daysUntilEnd: number;
        };
    }>;
    getApplications(electionId: string, filters: {
        status?: string;
        positionId?: string;
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
    approveApplication(electionId: string, applicationId: string, req: any): Promise<{
        application: {
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
        };
        candidate: {
            id: string;
            name: string;
            bio: string | null;
            createdAt: Date;
            electionId: string;
            position: number;
            photoUrl: string | null;
        };
    }>;
    rejectApplication(electionId: string, applicationId: string, req: any): Promise<{
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
    getSystemActivity(limit: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        action: string;
        details: string | null;
        userId: string;
    }[]>;
}
