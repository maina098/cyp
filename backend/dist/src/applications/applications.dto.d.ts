export declare class CreateApplicationDto {
    positionId: string;
    electionId: string;
    name: string;
    email: string;
    county: string;
    constituency?: string;
    age: number;
    description: string;
    reasonForApplying?: string;
    changeChampion: string;
    comments?: string;
}
export declare class UpdateApplicationStatusDto {
    status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
}
