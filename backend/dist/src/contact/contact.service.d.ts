import { PrismaService } from '../prisma.service';
export declare class ContactService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    submitMessage(data: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        subject: string;
        message: string;
        isRead: boolean;
    }>;
    getMessages(): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        subject: string;
        message: string;
        isRead: boolean;
    }[]>;
}
