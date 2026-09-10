"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    userSelect = {
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
    };
    getProfile(userId) {
        return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: this.userSelect });
    }
    async updateProfile(userId, dto) {
        if (dto.email) {
            const existing = await this.prisma.user.findFirst({ where: { email: dto.email, NOT: { id: userId } } });
            if (existing)
                throw new common_1.ConflictException('Email already registered');
        }
        const user = await this.prisma.user.update({ where: { id: userId }, data: dto, select: this.userSelect });
        await this.prisma.userActivity.create({
            data: {
                userId,
                email: user.email,
                name: user.name,
                action: 'profile_updated',
                details: 'Member profile details were updated',
            },
        });
        return user;
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(dto.newPassword, 12) } });
        return { message: 'Password changed successfully' };
    }
    async getDashboard(userId) {
        const [user, eventsAttended, publishedContentRead, publishedContentTotal, communityServices, recentActivity, events, resources, elections] = await Promise.all([
            this.getProfile(userId),
            this.prisma.userEventParticipation.count({ where: { userId, status: { in: ['ATTENDED', 'APPROVED'] } } }),
            this.prisma.userContentRead.count({
                where: { userId, contentType: { in: ['news', 'event', 'resource', 'governor', 'secretariat'] } },
            }),
            Promise.all([
                this.prisma.news.count({ where: { published: true } }),
                this.prisma.event.count({ where: { status: { not: 'CANCELLED' } } }),
                this.prisma.resource.count(),
                this.prisma.governor.count({ where: { status: 'ACTIVE' } }),
                this.prisma.secretariatMember.count({ where: { status: 'ACTIVE' } }),
            ]).then((counts) => counts.reduce((total, count) => total + count, 0)),
            this.prisma.communityService.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            this.prisma.userActivity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
            this.prisma.userEventParticipation.findMany({ where: { userId }, include: { event: true }, orderBy: { createdAt: 'desc' } }),
            this.prisma.resource.findMany({ orderBy: { createdAt: 'desc' } }),
            this.getElectionOverview(userId),
        ]);
        const communityScore = communityServices.reduce((score, item) => {
            if (item.status === 'APPROVED')
                return score + 10;
            if (item.status === 'PENDING')
                return score + 5;
            return score;
        }, 0);
        return {
            user,
            stats: {
                eventsAttended,
                newsRead: publishedContentRead,
                publishedContentRead,
                publishedContentTotal,
                communityScore,
                communityServicesInitiated: communityServices.length,
            },
            recentActivity,
            events,
            resources,
            elections,
        };
    }
    getActivities(userId) {
        return this.prisma.userActivity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 });
    }
    async recordContentRead(userId, dto) {
        return this.prisma.userContentRead.upsert({
            where: { userId_contentType_contentId: { userId, contentType: dto.contentType, contentId: dto.contentId } },
            update: { readAt: new Date() },
            create: { userId, contentType: dto.contentType, contentId: dto.contentId },
        });
    }
    async getEvents(userId) {
        return this.prisma.userEventParticipation.findMany({ where: { userId }, include: { event: true }, orderBy: { createdAt: 'desc' } });
    }
    async addEventParticipation(userId, eventId, dto) {
        const event = await this.prisma.event.findUnique({ where: { id: eventId } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        const participation = await this.prisma.userEventParticipation.create({ data: { userId, eventId, ...dto } });
        await this.prisma.userActivity.create({ data: { userId, email: (await this.getProfile(userId)).email, name: (await this.getProfile(userId)).name, action: 'event_submission', details: `Submitted participation for ${event.title}` } });
        return participation;
    }
    async addCommunityService(userId, dto) {
        const service = await this.prisma.communityService.create({ data: { userId, ...dto } });
        const user = await this.getProfile(userId);
        await this.prisma.userActivity.create({ data: { userId, email: user.email, name: user.name, action: 'community_service_submission', details: `Submitted ${dto.title}` } });
        return service;
    }
    getElectionOverview(userId) {
        return this.prisma.election.findMany({
            where: { status: { in: ['scheduled', 'active'] } },
            orderBy: { startsAt: 'asc' },
            include: {
                positions: { where: { isOpen: true }, orderBy: { createdAt: 'asc' } },
                candidates: { orderBy: { position: 'asc' } },
                applications: { where: { userId }, include: { position: true }, orderBy: { appliedAt: 'desc' } },
                electionResults: { include: { candidate: true }, orderBy: { voteCount: 'desc' } },
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map