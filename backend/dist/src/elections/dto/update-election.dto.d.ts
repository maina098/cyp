import { CreateElectionDto } from './create-election.dto';
declare const UpdateElectionDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateElectionDto>>;
export declare class UpdateElectionDto extends UpdateElectionDto_base {
    status?: 'draft' | 'scheduled' | 'active' | 'closed';
}
export {};
