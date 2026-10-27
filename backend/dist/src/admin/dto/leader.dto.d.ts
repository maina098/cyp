export declare class CreateLeaderDto {
    name: string;
    title: string;
    bio?: string | null;
    imageUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    userId?: string | null;
    sortOrder?: number;
}
declare const UpdateLeaderDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateLeaderDto>>;
export declare class UpdateLeaderDto extends UpdateLeaderDto_base {
}
export {};
