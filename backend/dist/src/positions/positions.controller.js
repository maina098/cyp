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
exports.PositionsController = void 0;
const common_1 = require("@nestjs/common");
const positions_service_1 = require("./positions.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PositionsController = class PositionsController {
    positionsService;
    constructor(positionsService) {
        this.positionsService = positionsService;
    }
    async getPositions(electionId) {
        if (!electionId) {
            throw new common_1.BadRequestException('electionId query parameter is required');
        }
        return this.positionsService.findAll(electionId);
    }
    async getAllPositions(electionId) {
        return this.positionsService.findAll(electionId);
    }
    async getOpenPositions(electionId) {
        return this.positionsService.findOpen(electionId);
    }
    async getPosition(id) {
        const position = await this.positionsService.findOne(id);
        if (!position) {
            throw new common_1.BadRequestException('Position not found');
        }
        return position;
    }
    async updatePositionStatus(id, body) {
        if (typeof body.isOpen !== 'boolean') {
            throw new common_1.BadRequestException('isOpen must be a boolean');
        }
        return this.positionsService.updateStatus(id, body.isOpen);
    }
    async getStats(electionId) {
        return this.positionsService.getPositionStats(electionId);
    }
};
exports.PositionsController = PositionsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "getPositions", null);
__decorate([
    (0, common_1.Get)('election/:electionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "getAllPositions", null);
__decorate([
    (0, common_1.Get)('open/:electionId'),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "getOpenPositions", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "getPosition", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "updatePositionStatus", null);
__decorate([
    (0, common_1.Get)('stats/:electionId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('electionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "getStats", null);
exports.PositionsController = PositionsController = __decorate([
    (0, common_1.Controller)('positions'),
    __metadata("design:paramtypes", [positions_service_1.PositionsService])
], PositionsController);
//# sourceMappingURL=positions.controller.js.map