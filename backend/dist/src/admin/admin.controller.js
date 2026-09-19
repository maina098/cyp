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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    getNews() {
        return this.adminService.getNews();
    }
    createNews(data) {
        return this.adminService.createNews(data);
    }
    updateNews(id, data) {
        return this.adminService.updateNews(id, data);
    }
    deleteNews(id) {
        return this.adminService.deleteNews(id);
    }
    getEvents() {
        return this.adminService.getEvents();
    }
    getMemberEventSubmissions() {
        return this.adminService.getMemberEventSubmissions();
    }
    updateMemberEventSubmissionStatus(submissionId, body) {
        return this.adminService.updateMemberEventSubmissionStatus(submissionId, body.status);
    }
    getMemberCommunityServices() {
        return this.adminService.getMemberCommunityServices();
    }
    createEvent(data) {
        return this.adminService.createEvent(data);
    }
    updateEvent(id, data) {
        return this.adminService.updateEvent(id, data);
    }
    deleteEvent(id) {
        return this.adminService.deleteEvent(id);
    }
    getResources() {
        return this.adminService.getResources();
    }
    createResource(data) {
        return this.adminService.createResource(data);
    }
    uploadResource(file) {
        if (!file)
            throw new common_1.BadRequestException('A resource file is required');
        return { url: `/uploads/resources/${file.filename}`, originalName: file.originalname, mediaType: file.mimetype, size: file.size };
    }
    updateResource(id, data) {
        return this.adminService.updateResource(id, data);
    }
    deleteResource(id) {
        return this.adminService.deleteResource(id);
    }
    createPosition(electionId, data) {
        return this.adminService.createPosition(electionId, data);
    }
    getPositions(electionId) {
        return this.adminService.getPositions(electionId);
    }
    async openPosition(positionId, body) {
        if (!body.electionId) {
            throw new common_1.BadRequestException('electionId is required');
        }
        return this.adminService.openPosition(body.electionId, positionId);
    }
    async closePosition(positionId, body) {
        if (!body.electionId) {
            throw new common_1.BadRequestException('electionId is required');
        }
        return this.adminService.closePosition(body.electionId, positionId);
    }
    getApplicationsByPosition(positionId) {
        return this.adminService.getApplicationsByPosition(positionId);
    }
    getApplicationStats(electionId) {
        return this.adminService.getApplicationStats(electionId);
    }
    getUserActivity(limit, page) {
        const limitNum = limit ? parseInt(limit, 10) : 50;
        const pageNum = page ? parseInt(page, 10) : 1;
        return this.adminService.getUserActivity(limitNum, pageNum);
    }
    getUserActivityStats() {
        return this.adminService.getUserActivityStats();
    }
    getUsers() {
        return this.adminService.getUsers();
    }
    updateUserRole(userId, body) {
        return this.adminService.updateUserRole(userId, body.role);
    }
    getAllApplications(query) {
        const { electionId, positionId, status, county, page, limit } = query;
        return this.adminService.getAllApplications({ electionId, positionId, status, county }, { page: page ? parseInt(page, 10) : 1, limit: limit ? parseInt(limit, 10) : 50 });
    }
    updateApplicationStatus(applicationId, body) {
        return this.adminService.updateApplicationStatus(applicationId, body.status);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('news'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getNews", null);
__decorate([
    (0, common_1.Post)('news'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createNews", null);
__decorate([
    (0, common_1.Patch)('news/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateNews", null);
__decorate([
    (0, common_1.Delete)('news/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteNews", null);
__decorate([
    (0, common_1.Get)('events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Get)('member-submissions/events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getMemberEventSubmissions", null);
__decorate([
    (0, common_1.Patch)('member-submissions/events/:submissionId/status'),
    __param(0, (0, common_1.Param)('submissionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateMemberEventSubmissionStatus", null);
__decorate([
    (0, common_1.Get)('member-submissions/community-services'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getMemberCommunityServices", null);
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Patch)('events/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)('events/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteEvent", null);
__decorate([
    (0, common_1.Get)('resources'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getResources", null);
__decorate([
    (0, common_1.Post)('resources'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createResource", null);
__decorate([
    (0, common_1.Post)('resources/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (_request, _file, callback) => { (0, fs_1.mkdirSync)('./uploads/resources', { recursive: true }); callback(null, './uploads/resources'); },
            filename: (_request, file, callback) => callback(null, `${(0, crypto_1.randomUUID)()}${(0, path_1.extname)(file.originalname).toLowerCase()}`),
        }),
        limits: { fileSize: 25 * 1024 * 1024 },
        fileFilter: (_request, file, callback) => callback(null, /^(image\/|application\/pdf$|application\/msword$|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document$|video\/)/.test(file.mimetype)),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "uploadResource", null);
__decorate([
    (0, common_1.Patch)('resources/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateResource", null);
__decorate([
    (0, common_1.Delete)('resources/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteResource", null);
__decorate([
    (0, common_1.Post)('elections/:electionId/positions'),
    __param(0, (0, common_1.Param)('electionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createPosition", null);
__decorate([
    (0, common_1.Get)('elections/:electionId/positions'),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getPositions", null);
__decorate([
    (0, common_1.Patch)('positions/:positionId/open'),
    __param(0, (0, common_1.Param)('positionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "openPosition", null);
__decorate([
    (0, common_1.Patch)('positions/:positionId/close'),
    __param(0, (0, common_1.Param)('positionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "closePosition", null);
__decorate([
    (0, common_1.Get)('positions/:positionId/applications'),
    __param(0, (0, common_1.Param)('positionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getApplicationsByPosition", null);
__decorate([
    (0, common_1.Get)('elections/:electionId/applications/stats'),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getApplicationStats", null);
__decorate([
    (0, common_1.Get)('activity'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user activity with pagination' }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserActivity", null);
__decorate([
    (0, common_1.Get)('activity/stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user activity statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUserActivityStats", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOperation)({ summary: 'Get registered members with profile details' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Patch)('users/:userId/role'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a member role' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateUserRole", null);
__decorate([
    (0, common_1.Get)('applications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all applications with pagination' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllApplications", null);
__decorate([
    (0, common_1.Patch)('applications/:applicationId/status'),
    __param(0, (0, common_1.Param)('applicationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateApplicationStatus", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_guard_1.Roles)('ADMIN'),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60_000 } }),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map