import { ContentService } from './content.service';
export declare class ContentController {
    private readonly contentService;
    constructor(contentService: ContentService);
    getOverview(): Promise<{
        stats: {
            governors: number;
            secretariat: number;
            news: number;
            events: number;
            resources: number;
        };
        sections: string[];
    }>;
    getNews(): Promise<{
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
