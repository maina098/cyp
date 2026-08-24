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
var WsJwtGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsJwtGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let WsJwtGuard = WsJwtGuard_1 = class WsJwtGuard {
    jwtService;
    logger = new common_1.Logger(WsJwtGuard_1.name);
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    canActivate(context) {
        const client = context.switchToWs().getClient();
        const token = client.handshake.auth?.token ||
            client.handshake.headers?.authorization?.replace('Bearer ', '') ||
            client.handshake.query?.token;
        if (!token) {
            this.logger.warn(`WebSocket connection rejected: missing token from ${client.id}`);
            client.emit('error', { message: 'Unauthorized: Authentication required' });
            client.disconnect();
            return false;
        }
        try {
            const payload = this.jwtService.verify(token);
            client.data.user = payload;
            this.logger.debug(`WebSocket authenticated for user ${payload.sub}`);
            return true;
        }
        catch (err) {
            this.logger.warn(`WebSocket connection rejected: invalid token from ${client.id}`);
            client.emit('error', { message: 'Unauthorized: Invalid token' });
            client.disconnect();
            return false;
        }
    }
};
exports.WsJwtGuard = WsJwtGuard;
exports.WsJwtGuard = WsJwtGuard = WsJwtGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], WsJwtGuard);
//# sourceMappingURL=ws-jwt.guard.js.map