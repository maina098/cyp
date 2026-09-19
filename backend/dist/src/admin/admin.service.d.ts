import { PrismaService } from '../prisma.service';
import { ResultsGateway } from '../results/results.gateway';
export declare class AdminService {
    private prisma;
    private resultsGateway;
    private readonly logger;
    constructor(prisma: PrismaService, resultsGateway: ResultsGateway);
    getNews(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            imageUrl: string | null;
            slug: string;
            title: string;
            summary: string;
            content: string;
            category: string;
            published: boolean;
            publishedAt: Date | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createNews(data: {
        title: string;
        slug: string;
        summary: string;
        content: string;
        category: string;
        imageUrl?: string;
        published?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        slug: string;
        title: string;
        summary: string;
        content: string;
        category: string;
        published: boolean;
        publishedAt: Date | null;
    }>;
    updateNews(id: string, data: Partial<{
        title: string;
        slug: string;
        summary: string;
        content: string;
        category: string;
        imageUrl: string;
        published: boolean;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        slug: string;
        title: string;
        summary: string;
        content: string;
        category: string;
        published: boolean;
        publishedAt: Date | null;
    }>;
    deleteNews(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        slug: string;
        title: string;
        summary: string;
        content: string;
        category: string;
        published: boolean;
        publishedAt: Date | null;
    }>;
    getEvents(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: string;
        title: string;
        description: string;
        location: string;
        date: Date;
    }[]>;
    getMemberEventSubmissions(): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            profileImageUrl: string | null;
        };
        event: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            imageUrl: string | null;
            status: string;
            title: string;
            description: string;
            location: string;
            date: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        userId: string;
        eventId: string;
        mediaUrl: string | null;
        mediaType: string | null;
    })[]>;
    updateMemberEventSubmissionStatus(submissionId: string, status: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
        event: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            imageUrl: string | null;
            status: string;
            title: string;
            description: string;
            location: string;
            date: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        userId: string;
        eventId: string;
        mediaUrl: string | null;
        mediaType: string | null;
    }>;
    getMemberCommunityServices(): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            profileImageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string;
        userId: string;
        mediaUrl: string | null;
        mediaType: string | null;
    })[]>;
    createEvent(data: {
        title: string;
        description: string;
        location: string;
        date: Date;
        status?: string;
        imageUrl?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: string;
        title: string;
        description: string;
        location: string;
        date: Date;
    }>;
    updateEvent(id: string, data: Partial<{
        title: string;
        description: string;
        location: string;
        date: Date;
        status: string;
        imageUrl: string;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: string;
        title: string;
        description: string;
        location: string;
        date: Date;
    }>;
    deleteEvent(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: string;
        title: string;
        description: string;
        location: string;
        date: Date;
    }>;
    getResources(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        category: string;
        description: string | null;
        fileUrl: string;
        downloadsCount: number;
    }[]>;
    createResource(data: {
        title: string;
        description?: string;
        fileUrl: string;
        category: string;
        downloadsCount?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        category: string;
        description: string | null;
        fileUrl: string;
        downloadsCount: number;
    }>;
    updateResource(id: string, data: Partial<{
        title: string;
        description: string;
        fileUrl: string;
        category: string;
        downloadsCount: number;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        category: string;
        description: string | null;
        fileUrl: string;
        downloadsCount: number;
    }>;
    deleteResource(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        category: string;
        description: string | null;
        fileUrl: string;
        downloadsCount: number;
    }>;
    createPosition(electionId: string, data: {
        title: string;
        description?: string;
        maxApplicants?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        electionId: string;
        isOpen: boolean;
        maxApplicants: number;
    }>;
    getPositions(electionId: string): Promise<({
        applications: {
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
        }[];
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
    openPosition(electionId: string, positionId: string): Promise<{
        applications: {
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
        }[];
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
    closePosition(electionId: string, positionId: string): Promise<{
        applications: {
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
        }[];
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
    getApplicationsByPosition(positionId: string): Promise<({
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
    getApplicationStats(electionId: string): Promise<{
        totalApplications: number;
        byPosition: Record<string, {
            title: string;
            count: number;
            statuses: Record<string, number>;
        }>;
        byStatus: {
            pending: number;
            approved: number;
            rejected: number;
            withdrawn: number;
        };
        byCounty: Record<string, number>;
    }>;
    trackUserActivity(userId: string, email: string, name: string, action: string, details?: string): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        action: string;
        details: string | null;
        userId: string;
    }>;
    getUserActivity(limit?: number, page?: number): Promise<{
        data: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            action: string;
            details: string | null;
            userId: string;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserActivityStats(): Promise<{
        totalActivities: number;
        activeUsers: number;
        byAction: Record<string, number>;
        recentActivities: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            action: string;
            details: string | null;
            userId: string;
        }[];
    }>;
    getUsers(): Promise<{
        id: string;
        email: string;
        name: string;
        profileImageUrl: string | null;
        phone: string | null;
        county: string | null;
        constituency: string | null;
        bio: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            votes: number;
            applications: number;
            activities: number;
        };
    }[]>;
    updateUserRole(userId: string, role: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
    }>;
    getAllApplications(filters?: {
        electionId?: string;
        positionId?: string;
        status?: string;
        county?: string;
    }, pagination?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
            election: {
                id: string;
                title: string;
            };
            position: {
                id: string;
                title: string;
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
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateApplicationStatus(applicationId: string, status: string): Promise<{
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
}
