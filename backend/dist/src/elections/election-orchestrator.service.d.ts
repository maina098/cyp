import { PrismaService } from '../prisma.service';
import { ResultsGateway } from '../results/results.gateway';
export declare enum ElectionStatusTransition {
    DRAFT_TO_SCHEDULED = "draft->scheduled",
    SCHEDULED_TO_ACTIVE = "scheduled->active",
    ACTIVE_TO_CLOSED = "active->closed",
    DRAFT_TO_ACTIVE = "draft->active",
    ANY_TO_DRAFT = "any->draft"
}
export declare class ElectionOrchestratorService {
    private prisma;
    private resultsGateway;
    constructor(prisma: PrismaService, resultsGateway: ResultsGateway);
    addCandidate(electionId: string, data: {
        name: string;
        bio?: string;
        photoUrl?: string;
        position?: number;
        positionId?: string;
    }, userId: string, userRole?: string): Promise<{
        id: string;
        name: string;
        bio: string | null;
        createdAt: Date;
        electionId: string;
        positionId: string;
        position: number;
        photoUrl: string | null;
    }>;
    removeCandidate(electionId: string, candidateId: string, userId: string, userRole?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    initializeElectionWithPositions(electionId: string, userId: string, userRole?: string): Promise<({
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
    transitionElectionStatus(electionId: string, newStatus: 'draft' | 'scheduled' | 'active' | 'closed', userId: string, userRole?: string): Promise<{
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
    openPositionsForApplications(electionId: string, positionIds: string[], userId: string, userRole?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        electionId: string;
        isOpen: boolean;
        maxApplicants: number;
    }[]>;
    closePositionsForApplications(electionId: string, positionIds: string[], userId: string, userRole?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        electionId: string;
        isOpen: boolean;
        maxApplicants: number;
    }[]>;
    getElectionDashboardStats(electionId: string): Promise<{
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
    getSystemActivity(limit?: number): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        action: string;
        details: string | null;
        userId: string;
    }[]>;
    getElectionApplications(electionId: string, filters?: {
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
    approveApplicationAndCreateCandidate(applicationId: string, electionId: string, userId: string, userRole?: string): Promise<{
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
            positionId: string;
            position: number;
            photoUrl: string | null;
        };
    }>;
    rejectApplication(applicationId: string, electionId: string, userId: string, userRole?: string): Promise<{
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
    getElectionTimeline(electionId: string): Promise<{
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
    private isValidStatusTransition;
    private executeStatusTransition;
    private computePositionResultsSnapshot;
    private getCurrentPhase;
}
