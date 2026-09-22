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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const results_gateway_1 = require("../results/results.gateway");
const audit_service_1 = require("../common/audit.service");
let AdminService = AdminService_1 = class AdminService {
    prisma;
    resultsGateway;
    auditService;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(prisma, resultsGateway, auditService) {
        this.prisma = prisma;
        this.resultsGateway = resultsGateway;
        this.auditService = auditService;
    }
    async getNews(page = 1, limit = 20) {
        this.logger.debug(`Fetching news items - page ${page}, limit ${limit}`);
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.news.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.news.count(),
        ]);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async createNews(data) {
        const created = await this.prisma.news.create({ data: { ...data, published: data.published ?? true } });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'news_created',
            details: `Created news item "${data.title}"`,
        });
        return created;
    }
    async updateNews(id, data) {
        const item = await this.prisma.news.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('News item not found');
        const updated = await this.prisma.news.update({ where: { id }, data });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'news_updated',
            details: `Updated news item "${data.title ?? item.title}"`,
        });
        return updated;
    }
    async deleteNews(id) {
        const item = await this.prisma.news.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('News item not found');
        const deleted = await this.prisma.news.delete({ where: { id } });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'news_deleted',
            details: `Deleted news item "${item.title}"`,
        });
        return deleted;
    }
    async getEvents() {
        return this.prisma.event.findMany({
            orderBy: { date: 'asc' },
        });
    }
    async getMemberEventSubmissions() {
        return this.prisma.userEventParticipation.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, profileImageUrl: true } },
                event: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateMemberEventSubmissionStatus(submissionId, status) {
        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            throw new common_1.BadRequestException('Invalid event submission status');
        }
        const submission = await this.prisma.userEventParticipation.findUnique({
            where: { id: submissionId },
            include: { user: true, event: true },
        });
        if (!submission)
            throw new common_1.NotFoundException('Event submission not found');
        const updated = await this.prisma.userEventParticipation.update({
            where: { id: submissionId },
            data: { status },
            include: { user: { select: { id: true, name: true, email: true } }, event: true },
        });
        await this.auditService.log({
            userId: submission.userId,
            email: submission.user.email,
            name: submission.user.name,
            action: `event_submission_${status.toLowerCase()}`,
            details: `${status} activity submission for ${submission.event.title}`,
        });
        await this.prisma.userActivity.create({
            data: {
                userId: submission.userId,
                email: submission.user.email,
                name: submission.user.name,
                action: `event_submission_${status.toLowerCase()}`,
                details: `${status} activity submission for ${submission.event.title}`,
            },
        });
        return updated;
    }
    async getMemberCommunityServices() {
        return this.prisma.communityService.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, profileImageUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createEvent(data) {
        const created = await this.prisma.event.create({ data });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'event_created',
            details: `Created event "${data.title}"`,
        });
        return created;
    }
    async updateEvent(id, data) {
        const item = await this.prisma.event.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Event not found');
        const updated = await this.prisma.event.update({ where: { id }, data });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'event_updated',
            details: `Updated event "${data.title ?? item.title}"`,
        });
        return updated;
    }
    async deleteEvent(id) {
        const item = await this.prisma.event.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Event not found');
        const deleted = await this.prisma.event.delete({ where: { id } });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'event_deleted',
            details: `Deleted event "${item.title}"`,
        });
        return deleted;
    }
    async getResources() {
        return this.prisma.resource.findMany();
    }
    async createResource(data) {
        const created = await this.prisma.resource.create({ data });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'resource_created',
            details: `Created resource "${data.title}"`,
        });
        return created;
    }
    async updateResource(id, data) {
        const item = await this.prisma.resource.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Resource not found');
        const updated = await this.prisma.resource.update({ where: { id }, data });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'resource_updated',
            details: `Updated resource "${data.title ?? item.title}"`,
        });
        return updated;
    }
    async deleteResource(id) {
        const item = await this.prisma.resource.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Resource not found');
        const deleted = await this.prisma.resource.delete({ where: { id } });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'resource_deleted',
            details: `Deleted resource "${item.title}"`,
        });
        return deleted;
    }
    async createPosition(electionId, data) {
        const election = await this.prisma.election.findUnique({ where: { id: electionId } });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const existing = await this.prisma.electionPosition.findUnique({
            where: { electionId_title: { electionId, title: data.title } },
        });
        if (existing) {
            throw new common_1.BadRequestException('Position already exists for this election');
        }
        const position = await this.prisma.electionPosition.create({
            data: {
                electionId,
                title: data.title,
                description: data.description,
                maxApplicants: data.maxApplicants || 100,
                isOpen: false,
            },
        });
        return position;
    }
    async getPositions(electionId) {
        return this.prisma.electionPosition.findMany({
            where: { electionId },
            include: { applications: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    async openPosition(electionId, positionId) {
        const election = await this.prisma.election.findUnique({ where: { id: electionId } });
        if (!election)
            throw new common_1.NotFoundException('Election not found');
        if (!['draft', 'scheduled', 'active'].includes(election.status)) {
            throw new common_1.BadRequestException('Applications can only be opened for draft, scheduled, or active elections');
        }
        const position = await this.prisma.electionPosition.findUnique({
            where: { id: positionId },
        });
        if (!position || position.electionId !== electionId) {
            throw new common_1.NotFoundException('Position not found');
        }
        const updated = await this.prisma.electionPosition.update({
            where: { id: positionId },
            data: { isOpen: true },
            include: { applications: true },
        });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'position_opened',
            details: `Opened applications for position ${position.title ?? positionId} in election ${electionId}`,
        });
        this.resultsGateway.broadcastPositionStatusChange(electionId, updated);
        return updated;
    }
    async closePosition(electionId, positionId) {
        const position = await this.prisma.electionPosition.findUnique({
            where: { id: positionId },
        });
        if (!position || position.electionId !== electionId) {
            throw new common_1.NotFoundException('Position not found');
        }
        const updated = await this.prisma.electionPosition.update({
            where: { id: positionId },
            data: { isOpen: false },
            include: { applications: true },
        });
        await this.auditService.log({
            userId: 'system-admin',
            action: 'position_closed',
            details: `Closed applications for position ${position.title ?? positionId} in election ${electionId}`,
        });
        this.resultsGateway.broadcastPositionStatusChange(electionId, updated);
        return updated;
    }
    async getApplicationsByPosition(positionId) {
        const position = await this.prisma.electionPosition.findUnique({
            where: { id: positionId },
        });
        if (!position) {
            throw new common_1.NotFoundException('Position not found');
        }
        return this.prisma.electionApplication.findMany({
            where: { positionId },
            include: {
                user: { select: { id: true, email: true, name: true } },
                position: true,
                election: true,
            },
            orderBy: { appliedAt: 'desc' },
        });
    }
    async getApplicationStats(electionId) {
        const positions = await this.prisma.electionPosition.findMany({
            where: { electionId },
            include: { applications: true },
        });
        const stats = {
            totalApplications: 0,
            byPosition: {},
            byStatus: { pending: 0, approved: 0, rejected: 0, withdrawn: 0 },
            byCounty: {},
        };
        for (const position of positions) {
            const appCount = position.applications.length;
            stats.totalApplications += appCount;
            stats.byPosition[position.id] = {
                title: position.title,
                count: appCount,
                statuses: {
                    pending: position.applications.filter((a) => a.status === 'pending').length,
                    approved: position.applications.filter((a) => a.status === 'approved').length,
                    rejected: position.applications.filter((a) => a.status === 'rejected').length,
                    withdrawn: position.applications.filter((a) => a.status === 'withdrawn').length,
                },
            };
            for (const app of position.applications) {
                stats.byStatus[app.status] = (stats.byStatus[app.status] || 0) + 1;
                stats.byCounty[app.county] = (stats.byCounty[app.county] || 0) + 1;
            }
        }
        return stats;
    }
    async trackUserActivity(userId, email, name, action, details) {
        return this.prisma.userActivity.create({
            data: {
                userId,
                email,
                name,
                action,
                details,
            },
        });
    }
    async getUserActivity(limit = 50, page = 1) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.userActivity.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.userActivity.count(),
        ]);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getUserActivityStats() {
        const activities = await this.prisma.userActivity.findMany({
            orderBy: { createdAt: 'desc' },
            take: 1000,
        });
        const stats = {
            totalActivities: activities.length,
            activeUsers: new Set(activities.map(a => a.userId)).size,
            byAction: {},
            recentActivities: activities.slice(0, 20),
        };
        for (const activity of activities) {
            stats.byAction[activity.action] = (stats.byAction[activity.action] || 0) + 1;
        }
        return stats;
    }
    async getUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                profileImageUrl: true,
                phone: true,
                county: true,
                constituency: true,
                bio: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { activities: true, applications: true, votes: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateUserRole(userId, role) {
        const normalizedRole = role.toUpperCase();
        if (!['USER', 'ADMIN'].includes(normalizedRole)) {
            throw new common_1.BadRequestException('Role must be USER or ADMIN');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.user.update({
            where: { id: userId },
            data: { role: normalizedRole },
            select: { id: true, email: true, name: true, role: true },
        });
    }
    async getAllApplications(filters, pagination) {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 50;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.electionId)
            where.electionId = filters.electionId;
        if (filters?.positionId)
            where.positionId = filters.positionId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.county)
            where.county = filters.county;
        const [data, total] = await Promise.all([
            this.prisma.electionApplication.findMany({
                where,
                include: {
                    user: { select: { id: true, email: true, name: true } },
                    position: {
                        select: { id: true, title: true },
                    },
                    election: {
                        select: { id: true, title: true },
                    },
                },
                skip,
                take: limit,
                orderBy: { appliedAt: 'desc' },
            }),
            this.prisma.electionApplication.count({ where }),
        ]);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateApplicationStatus(applicationId, status) {
        const application = await this.prisma.electionApplication.findUnique({
            where: { id: applicationId },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const updated = await this.prisma.electionApplication.update({
            where: { id: applicationId },
            data: { status },
            include: {
                user: { select: { id: true, email: true, name: true } },
                position: true,
                election: true,
            },
        });
        await this.auditService.log({
            userId: application.userId || 'system-admin',
            email: application.email,
            name: application.name,
            action: 'application_status_changed',
            details: `Updated application ${application.id} to ${status}`,
        });
        return updated;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        results_gateway_1.ResultsGateway,
        audit_service_1.AuditService])
], AdminService);
//# sourceMappingURL=admin.service.js.map