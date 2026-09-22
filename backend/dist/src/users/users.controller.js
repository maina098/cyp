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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const users_dto_1 = require("./users.dto");
const users_service_1 = require("./users.service");
const allowedMemberUploadMimes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
function normalizeUploadName(fileName) {
    return fileName
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .slice(0, 120)
        || 'upload';
}
const uploadStorage = (0, multer_1.diskStorage)({
    destination: (_request, _file, callback) => {
        const destination = './uploads/member-submissions';
        (0, fs_1.mkdirSync)(destination, { recursive: true });
        callback(null, destination);
    },
    filename: (_request, file, callback) => callback(null, `${(0, crypto_1.randomUUID)()}${(0, path_1.extname)(file.originalname).toLowerCase()}`),
});
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getProfile(req) {
        return this.usersService.getProfile(req.user.id);
    }
    updateProfile(req, dto) {
        return this.usersService.updateProfile(req.user.id, dto);
    }
    uploadProfilePicture(req, file) {
        if (!file)
            throw new common_1.BadRequestException('An image file is required');
        return this.usersService.updateProfile(req.user.id, { profileImageUrl: `/uploads/member-submissions/${file.filename}` });
    }
    uploadMemberFile(file) {
        if (!file)
            throw new common_1.BadRequestException('A picture, PDF, or Word document is required');
        return {
            url: `/uploads/member-submissions/${file.filename}`,
            originalName: file.originalname,
            mediaType: file.mimetype,
            size: file.size,
        };
    }
    changePassword(req, dto) {
        return this.usersService.changePassword(req.user.id, dto);
    }
    getDashboard(req) {
        return this.usersService.getDashboard(req.user.id);
    }
    getActivities(req) {
        return this.usersService.getActivities(req.user.id);
    }
    recordContentRead(req, dto) {
        return this.usersService.recordContentRead(req.user.id, dto);
    }
    getEvents(req) {
        return this.usersService.getEvents(req.user.id);
    }
    addEventParticipation(req, eventId, dto) {
        return this.usersService.addEventParticipation(req.user.id, eventId, dto);
    }
    addCommunityService(req, dto) {
        return this.usersService.addCommunityService(req.user.id, dto);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('profile-picture'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: uploadStorage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_request, file, callback) => {
            const allowed = file.mimetype.startsWith('image/') && allowedMemberUploadMimes.has(file.mimetype);
            callback(allowed ? null : new Error('Image uploads must be JPG, PNG, GIF, or WebP'), allowed);
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "uploadProfilePicture", null);
__decorate([
    (0, common_1.Post)('uploads'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: uploadStorage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_request, file, callback) => {
            const allowed = allowedMemberUploadMimes.has(file.mimetype) || file.mimetype.startsWith('image/');
            callback(allowed ? null : new Error('Unsupported file type'), allowed);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "uploadMemberFile", null);
__decorate([
    (0, common_1.Patch)('password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('activities'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getActivities", null);
__decorate([
    (0, common_1.Post)('content-reads'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.RecordContentReadDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "recordContentRead", null);
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Post)('events/:eventId/participation'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('eventId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, users_dto_1.CreateEventParticipationDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "addEventParticipation", null);
__decorate([
    (0, common_1.Post)('community-services'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.CreateCommunityServiceDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "addCommunityService", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('users/me'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map