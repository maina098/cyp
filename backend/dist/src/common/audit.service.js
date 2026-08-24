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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let AuditService = AuditService_1 = class AuditService {
    prisma;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
        try {
            await this.prisma.userActivity.create({
                data: {
                    userId: data.userId,
                    email: data.email || '',
                    name: data.name || '',
                    action: data.action,
                    details: data.details,
                },
            });
            this.logger.debug(`Audit log: ${data.action} by user ${data.userId}`);
        }
        catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`);
        }
    }
    async logLogin(userId, email, name) {
        await this.log({
            userId,
            email,
            name,
            action: 'login',
            details: `User logged in at ${new Date().toISOString()}`,
        });
    }
    async logLogout(userId, email) {
        await this.log({
            userId,
            email,
            action: 'logout',
            details: `User logged out at ${new Date().toISOString()}`,
        });
    }
    async logVote(userId, electionId, candidateId) {
        await this.log({
            userId,
            action: 'vote_cast',
            details: `Voted in election ${electionId} for candidate ${candidateId}`,
        });
    }
    async logApplicationCreate(userId, electionId, positionId) {
        await this.log({
            userId,
            action: 'application_created',
            details: `Applied for position ${positionId} in election ${electionId}`,
        });
    }
    async logApplicationStatusChange(adminUserId, applicationId, oldStatus, newStatus) {
        await this.log({
            userId: adminUserId,
            action: 'application_status_changed',
            details: `Changed application ${applicationId} status from ${oldStatus} to ${newStatus}`,
        });
    }
    async logElectionCreate(userId, electionId, title) {
        await this.log({
            userId,
            action: 'election_created',
            details: `Created election "${title}" (${electionId})`,
        });
    }
    async logElectionStatusChange(userId, electionId, oldStatus, newStatus) {
        await this.log({
            userId,
            action: 'election_status_changed',
            details: `Changed election ${electionId} status from ${oldStatus} to ${newStatus}`,
        });
    }
    async logFailedLogin(email, ipAddress) {
        await this.log({
            userId: 'anonymous',
            email,
            action: 'failed_login',
            details: `Failed login attempt for ${email} from ${ipAddress || 'unknown IP'}`,
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map