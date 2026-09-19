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
var VotesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const crypto_1 = require("crypto");
const email_service_1 = require("../auth/email.service");
let VotesService = VotesService_1 = class VotesService {
    prisma;
    emailService;
    logger = new common_1.Logger(VotesService_1.name);
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async castVote(electionId, castVoteDto, voterId, resultsGateway) {
        this.logger.log(`User ${voterId} attempting to vote in election ${electionId}`);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const election = await tx.election.findUnique({
                    where: { id: electionId },
                });
                if (!election) {
                    throw new common_1.NotFoundException('Election not found');
                }
                const now = new Date();
                if (election.status !== 'active') {
                    throw new common_1.ForbiddenException('Election is not currently active');
                }
                if (now < election.startsAt || now > election.endsAt) {
                    throw new common_1.ForbiddenException('Outside voting window');
                }
                const candidate = await tx.candidate.findUnique({
                    where: { id: castVoteDto.candidateId },
                });
                if (!candidate) {
                    throw new common_1.NotFoundException('Candidate not found');
                }
                if (candidate.electionId !== electionId) {
                    throw new common_1.ForbiddenException('Candidate does not belong to this election');
                }
                const voter = tx.user
                    ? await tx.user.findUnique({ where: { id: voterId } })
                    : null;
                const vote = await tx.vote.create({
                    data: {
                        electionId,
                        candidateId: castVoteDto.candidateId,
                        positionId: candidate.positionId,
                        voterId,
                    },
                });
                await tx.electionResult.upsert({
                    where: {
                        electionId_candidateId: {
                            electionId,
                            candidateId: castVoteDto.candidateId,
                        },
                    },
                    update: {
                        voteCount: {
                            increment: 1,
                        },
                    },
                    create: {
                        electionId,
                        candidateId: castVoteDto.candidateId,
                        voteCount: 1,
                    },
                });
                await tx.userActivity.create({
                    data: {
                        userId: voterId,
                        email: voter?.email || '',
                        name: voter?.name || '',
                        action: 'vote',
                        details: `Voted in election ${electionId} for candidate ${castVoteDto.candidateId}`,
                    },
                });
                return vote;
            });
            if (resultsGateway) {
                const results = await this.prisma.electionResult.findMany({
                    where: { electionId },
                    include: { candidate: true },
                    orderBy: { voteCount: 'desc' },
                });
                resultsGateway.broadcastResults(electionId, results);
            }
            this.logger.log(`User ${voterId} successfully voted in election ${electionId}`);
            return { success: true, message: 'Vote cast successfully' };
        }
        catch (error) {
            if (error.code === 'P2002') {
                this.logger.warn(`Duplicate vote attempt by user ${voterId} in election ${electionId}`);
                throw new common_1.ConflictException('You have already voted for this position');
            }
            this.logger.error(`Vote failed for user ${voterId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async requestVotingOtp(electionId, userId) {
        const election = await this.prisma.election.findUnique({ where: { id: electionId } });
        if (!election) {
            throw new common_1.NotFoundException('Election not found');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        const otpCode = (0, crypto_1.randomInt)(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        const otpHash = this.hashOptCode(otpCode);
        const otp = await this.prisma.voteOtp.create({
            data: {
                electionId,
                userId,
                codeHash: otpHash,
                expiresAt,
            },
        });
        await this.emailService.sendVotingOtpEmail(user.email, otpCode, election.title);
        return {
            otpId: otp.id,
            expiresAt,
            message: 'OTP created. Use the code in the verification step.',
        };
    }
    async verifyVotingOtp(electionId, userId, otpId, otpCode) {
        const otp = await this.prisma.voteOtp.findFirst({
            where: {
                id: otpId,
                electionId,
                userId,
                usedAt: null,
            },
        });
        if (!otp) {
            throw new common_1.BadRequestException('OTP is invalid or already used');
        }
        if (otp.expiresAt <= new Date()) {
            throw new common_1.BadRequestException('OTP has expired');
        }
        if (this.hashOptCode(otpCode) !== otp.codeHash) {
            throw new common_1.BadRequestException('OTP is incorrect');
        }
        await this.prisma.voteOtp.update({
            where: { id: otp.id },
            data: { verifiedAt: new Date() },
        });
        return {
            valid: true,
            otpId: otp.id,
            expiresAt: otp.expiresAt,
            message: 'OTP verified successfully',
        };
    }
    async createVotingSession(electionId, userId, otpId) {
        const otp = await this.prisma.voteOtp.findUnique({ where: { id: otpId } });
        if (!otp || otp.userId !== userId || otp.electionId !== electionId || !otp.verifiedAt) {
            throw new common_1.BadRequestException('OTP has not been verified for this election');
        }
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const session = await this.prisma.votingSession.create({
            data: {
                electionId,
                userId,
                otpId,
                expiresAt,
            },
        });
        return {
            sessionId: session.id,
            expiresAt,
            message: 'Voting session started successfully',
        };
    }
    async validateVotingSession(electionId, userId, sessionId) {
        const session = await this.prisma.votingSession.findFirst({
            where: {
                id: sessionId,
                electionId,
                userId,
                completedAt: null,
            },
        });
        if (!session) {
            throw new common_1.BadRequestException('Voting session is invalid or already completed');
        }
        if (session.expiresAt <= new Date()) {
            throw new common_1.BadRequestException('Voting session has expired');
        }
        return { valid: true, sessionId: session.id, expiresAt: session.expiresAt };
    }
    hashOptCode(code) {
        return (0, crypto_1.createHash)('sha256').update(code).digest('hex');
    }
    async getUserVote(electionId, voterId) {
        return this.prisma.vote.findMany({
            where: { electionId, voterId },
            orderBy: { votedAt: 'asc' },
        });
    }
    async getElectionVotes(electionId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.vote.findMany({
                where: { electionId },
                include: {
                    candidate: { select: { id: true, name: true } },
                    voter: { select: { id: true, name: true } }
                },
                skip,
                take: limit,
                orderBy: { votedAt: 'desc' },
            }),
            this.prisma.vote.count({ where: { electionId } }),
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
};
exports.VotesService = VotesService;
exports.VotesService = VotesService = VotesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, email_service_1.EmailService])
], VotesService);
//# sourceMappingURL=votes.service.js.map