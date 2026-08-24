import { ContactService } from './contact.service';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
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
