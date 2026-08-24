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
exports.ElectionOrchestratorController = void 0;
const common_1 = require("@nestjs/common");
const election_orchestrator_service_1 = require("./election-orchestrator.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ElectionOrchestratorController = class ElectionOrchestratorController {
    orchestrator;
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
    }
    initializeElection(electionId, req) {
        return this.orchestrator.initializeElectionWithPositions(electionId, req.user.id);
    }
    transitionStatus(electionId, body, req) {
        return this.orchestrator.transitionElectionStatus(electionId, body.status, req.user.id);
    }
    openPositions(electionId, body, req) {
        return this.orchestrator.openPositionsForApplications(electionId, body.positionIds, req.user.id);
    }
    closePositions(electionId, body, req) {
        return this.orchestrator.closePositionsForApplications(electionId, body.positionIds, req.user.id);
    }
    getDashboardStats(electionId) {
        return this.orchestrator.getElectionDashboardStats(electionId);
    }
    getTimeline(electionId) {
        return this.orchestrator.getElectionTimeline(electionId);
    }
    getApplications(electionId, filters) {
        return this.orchestrator.getElectionApplications(electionId, filters);
    }
    approveApplication(electionId, applicationId, req) {
        return this.orchestrator.approveApplicationAndCreateCandidate(applicationId, req.user.id);
    }
    rejectApplication(electionId, applicationId, req) {
        return this.orchestrator.rejectApplication(applicationId, req.user.id);
    }
    getSystemActivity(limit) {
        return this.orchestrator.getSystemActivity(limit ? parseInt(limit, 10) : 50);
    }
};
exports.ElectionOrchestratorController = ElectionOrchestratorController;
__decorate([
    (0, common_1.Post)(':id/initialize'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ElectionOrchestratorController.prototype, "initializeElection", null);
__decorate([
    (0, common_1.Patch)(':id/transition-status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ElectionOrchestratorController.prototype, "transitionStatus", null);
__decorate([
    (0, common_1.Post)(':id/open-positions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ElectionOrchestratorController.prototype, "openPositions", null);
__decorate([
    (0, common_1.Post)(':id/close-positions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ElectionOrchestratorController.prototype, "closePositions", null);
__decorate([
    (0, common_1.Get)(':id/dashboard-stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ElectionOrchestratorController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ElectionOrchestratorController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Get)(':id/applications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ElectionOrchestratorController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Post)(':id/applications/:appId/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('appId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ElectionOrchestratorController.prototype, "approveApplication", null);
__decorate([
    (0, common_1.Post)(':id/applications/:appId/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('appId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], ElectionOrchestratorController.prototype, "rejectApplication", null);
__decorate([
    (0, common_1.Get)('system/activity'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ElectionOrchestratorController.prototype, "getSystemActivity", null);
exports.ElectionOrchestratorController = ElectionOrchestratorController = __decorate([
    (0, common_1.Controller)('elections'),
    __metadata("design:paramtypes", [election_orchestrator_service_1.ElectionOrchestratorService])
], ElectionOrchestratorController);
//# sourceMappingURL=election-orchestrator.controller.js.map