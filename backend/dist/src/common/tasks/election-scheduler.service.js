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
exports.ElectionSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const elections_service_1 = require("../../elections/elections.service");
const results_gateway_1 = require("../../results/results.gateway");
let ElectionSchedulerService = class ElectionSchedulerService {
    electionsService;
    resultsGateway;
    constructor(electionsService, resultsGateway) {
        this.electionsService = electionsService;
        this.resultsGateway = resultsGateway;
    }
    async syncElectionStatuses() {
        const now = new Date();
        await this.electionsService.activateDueElections(now);
        const closedElections = await this.electionsService.closeExpiredElections(now);
        for (const election of closedElections) {
            this.resultsGateway.broadcastStatusChange(election);
        }
    }
};
exports.ElectionSchedulerService = ElectionSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ElectionSchedulerService.prototype, "syncElectionStatuses", null);
exports.ElectionSchedulerService = ElectionSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elections_service_1.ElectionsService,
        results_gateway_1.ResultsGateway])
], ElectionSchedulerService);
//# sourceMappingURL=election-scheduler.service.js.map