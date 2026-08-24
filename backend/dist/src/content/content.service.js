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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ContentService = class ContentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardOverview() {
        const [governors, secretariat, news, events, resources] = await Promise.all([
            this.prisma.governor.count({ where: { status: 'ACTIVE' } }),
            this.prisma.secretariatMember.count({ where: { status: 'ACTIVE' } }),
            this.prisma.news.count({ where: { published: true } }),
            this.prisma.event.count(),
            this.prisma.resource.count(),
        ]);
        return {
            stats: {
                governors,
                secretariat,
                news,
                events,
                resources,
            },
            sections: [
                'About',
                'Resources',
                'News & Updates',
                'Events',
                'Contact',
            ],
        };
    }
    async getPublishedNews() {
        return this.prisma.news.findMany({
            where: { published: true },
            orderBy: { publishedAt: 'desc' },
            take: 10,
        });
    }
    async getUpcomingEvents() {
        return this.prisma.event.findMany({
            orderBy: { date: 'asc' },
            take: 10,
        });
    }
    async getResources() {
        return this.prisma.resource.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
    }
    async getGovernors() {
        return this.prisma.governor.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { name: 'asc' },
        });
    }
    async getSecretariat() {
        return this.prisma.secretariatMember.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { name: 'asc' },
        });
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentService);
//# sourceMappingURL=content.service.js.map