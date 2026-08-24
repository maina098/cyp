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
exports.VotesController = void 0;
const common_1 = require("@nestjs/common");
const votes_service_1 = require("./votes.service");
const cast_vote_dto_1 = require("./dto/cast-vote.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const results_gateway_1 = require("../results/results.gateway");
let VotesController = class VotesController {
    votesService;
    resultsGateway;
    constructor(votesService, resultsGateway) {
        this.votesService = votesService;
        this.resultsGateway = resultsGateway;
    }
    castVote(electionId, castVoteDto, req) {
        return this.votesService.castVote(electionId, castVoteDto, req.user.id, this.resultsGateway);
    }
    getUserVote(electionId, req) {
        return this.votesService.getUserVote(electionId, req.user.id);
    }
    getElectionVotes(electionId) {
        return this.votesService.getElectionVotes(electionId);
    }
};
exports.VotesController = VotesController;
__decorate([
    (0, common_1.Post)('elections/:id/vote'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cast_vote_dto_1.CastVoteDto, Object]),
    __metadata("design:returntype", void 0)
], VotesController.prototype, "castVote", null);
__decorate([
    (0, common_1.Get)('elections/:id/my-vote'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VotesController.prototype, "getUserVote", null);
__decorate([
    (0, common_1.Get)('elections/:id/votes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VotesController.prototype, "getElectionVotes", null);
exports.VotesController = VotesController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [votes_service_1.VotesService,
        results_gateway_1.ResultsGateway])
], VotesController);
//# sourceMappingURL=votes.controller.js.map