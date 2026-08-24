export declare class CreateElectionDto {
    title: string;
    description?: string;
    status?: 'draft' | 'scheduled' | 'active' | 'closed';
    startsAt: string;
    endsAt: string;
    candidates: Array<{
        name: string;
        bio?: string;
        photoUrl?: string;
        position?: number;
    }>;
}
