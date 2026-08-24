export declare class Election {
    id: string;
    title: string;
    description?: string;
    status: 'draft' | 'scheduled' | 'active' | 'closed';
    startsAt: Date;
    endsAt: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
