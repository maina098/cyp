"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectionsModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const elections_service_1 = require("./elections.service");
const elections_controller_1 = require("./elections.controller");
const election_orchestrator_service_1 = require("./election-orchestrator.service");
const election_orchestrator_controller_1 = require("./election-orchestrator.controller");
const prisma_module_1 = require("../prisma.module");
const results_module_1 = require("../results/results.module");
const election_scheduler_service_1 = require("../common/tasks/election-scheduler.service");
let ElectionsModule = class ElectionsModule {
};
exports.ElectionsModule = ElectionsModule;
exports.ElectionsModule = ElectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, schedule_1.ScheduleModule.forRoot(), results_module_1.ResultsModule],
        controllers: [elections_controller_1.ElectionsController, election_orchestrator_controller_1.ElectionOrchestratorController],
        providers: [
            elections_service_1.ElectionsService,
            election_orchestrator_service_1.ElectionOrchestratorService,
            election_scheduler_service_1.ElectionSchedulerService,
        ],
        exports: [
            elections_service_1.ElectionsService,
            election_orchestrator_service_1.ElectionOrchestratorService,
            results_module_1.ResultsModule,
        ],
    })
], ElectionsModule);
//# sourceMappingURL=elections.module.js.map