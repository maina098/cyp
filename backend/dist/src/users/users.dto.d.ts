export declare class UpdateProfileDto {
    name?: string;
    email?: string;
    profileImageUrl?: string;
    phone?: string;
    county?: string;
    constituency?: string;
    bio?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class RecordContentReadDto {
    contentType: string;
    contentId: string;
}
export declare class CreateEventParticipationDto {
    title: string;
    description?: string;
    mediaUrl?: string;
    mediaType?: string;
}
export declare class CreateCommunityServiceDto {
    title: string;
    description: string;
    mediaUrl?: string;
    mediaType?: string;
}
