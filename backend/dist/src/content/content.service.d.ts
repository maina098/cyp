import { PrismaService } from '../prisma.service';
export declare class ContentService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardOverview(): Promise<{
        stats: {
            governors: number;
            secretariat: number;
            news: number;
            events: number;
            resources: number;
        };
        sections: string[];
    }>;
    getPublishedNews(): Promise<{
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
    }[]>;
    getUpcomingEvents(): Promise<{
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
    getGovernors(): Promise<{
        id: string;
        name: string;
        county: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        termStart: string | null;
        termEnd: string | null;
        status: string;
    }[]>;
    getSecretariat(): Promise<{
        id: string;
        name: string;
        bio: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        status: string;
    }[]>;
}
