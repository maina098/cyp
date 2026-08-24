"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateApplicationStatusDto = exports.CreateApplicationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateApplicationDto {
    positionId;
    electionId;
    name;
    email;
    county;
    constituency;
    age;
    description;
    reasonForApplying;
    changeChampion;
    comments;
}
exports.CreateApplicationDto = CreateApplicationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Position ID to apply for' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "positionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Election ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "electionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', minLength: 2, maxLength: 100 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john@example.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mombasa' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "county", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Nyali' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "constituency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25, minimum: 16, maximum: 120 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(16),
    (0, class_validator_1.Max)(120),
    __metadata("design:type", Number)
], CreateApplicationDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Brief description about yourself', maxLength: 2000 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for applying', maxLength: 1000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "reasonForApplying", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'What change would you like to champion for', maxLength: 1000 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "changeChampion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional comments', maxLength: 500 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateApplicationDto.prototype, "comments", void 0);
class UpdateApplicationStatusDto {
    status;
}
exports.UpdateApplicationStatusDto = UpdateApplicationStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['pending', 'approved', 'rejected', 'withdrawn'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['pending', 'approved', 'rejected', 'withdrawn']),
    __metadata("design:type", String)
], UpdateApplicationStatusDto.prototype, "status", void 0);
//# sourceMappingURL=applications.dto.js.map