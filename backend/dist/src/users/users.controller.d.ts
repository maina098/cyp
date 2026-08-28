import { ChangePasswordDto, CreateCommunityServiceDto, CreateEventParticipationDto, RecordContentReadDto, UpdateProfileDto } from './users.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: any): import("@prisma/client").Prisma.Prisma__UserClient<{
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
    }, never, import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
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
    }>;
    uploadProfilePicture(req: any, file: {
        filename: string;
    } | undefined): Promise<{
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
    }>;
    uploadMemberFile(file: {
        filename: string;
        originalname: string;
        mimetype: string;
        size: number;
    } | undefined): {
        url: string;
        originalName: string;
        mediaType: string;
        size: number;
    };
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getDashboard(req: any): Promise<{
        user: {
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
        };
        stats: {
            eventsAttended: number;
            newsRead: number;
            publishedContentRead: number;
            publishedContentTotal: number;
            communityScore: number;
            communityServicesInitiated: number;
        };
        recentActivity: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            action: string;
            details: string | null;
            userId: string;
        }[];
        events: ({
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
        })[];
        resources: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            category: string;
            description: string | null;
            fileUrl: string;
            downloadsCount: number;
        }[];
        elections: ({
            applications: ({
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
            })[];
            candidates: {
                id: string;
                name: string;
                bio: string | null;
                createdAt: Date;
                electionId: string;
                positionId: string | null;
                position: number;
                photoUrl: string | null;
            }[];
            electionResults: ({
                candidate: {
                    id: string;
                    name: string;
                    bio: string | null;
                    createdAt: Date;
                    electionId: string;
                    positionId: string | null;
                    position: number;
                    photoUrl: string | null;
                };
            } & {
                id: string;
                updatedAt: Date;
                electionId: string;
                candidateId: string;
                voteCount: number;
            })[];
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
        })[];
    }>;
    getActivities(req: any): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        action: string;
        details: string | null;
        userId: string;
    }[]>;
    recordContentRead(req: any, dto: RecordContentReadDto): Promise<{
        id: string;
        userId: string;
        contentType: string;
        contentId: string;
        readAt: Date;
    }>;
    getEvents(req: any): Promise<({
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
    addEventParticipation(req: any, eventId: string, dto: CreateEventParticipationDto): Promise<{
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
    addCommunityService(req: any, dto: CreateCommunityServiceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string;
        userId: string;
        mediaUrl: string | null;
        mediaType: string | null;
    }>;
}
