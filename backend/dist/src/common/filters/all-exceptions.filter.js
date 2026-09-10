"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = class AllExceptionsFilter {
    logger = new common_1.Logger('ExceptionFilter');
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const databaseErrorCodes = new Set(['P1000', 'P1001', 'P1002', 'P2039', 'ETIMEDOUT', 'ENOTFOUND']);
        const errorCode = exception && typeof exception === 'object' && 'code' in exception
            ? String(exception.code)
            : '';
        const databaseUnavailable = databaseErrorCodes.has(errorCode);
        const status = databaseUnavailable
            ? common_1.HttpStatus.SERVICE_UNAVAILABLE
            : exception instanceof common_1.HttpException
                ? exception.getStatus()
                : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = databaseUnavailable
            ? 'Database unavailable. Check the backend DATABASE_URL and Supabase project status.'
            : exception instanceof common_1.HttpException
                ? exception.getResponse()
                : 'Internal server error';
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: typeof message === 'string' ? message : message.message || message,
        };
        if (exception instanceof Error) {
            this.logger.error(`${request.method} ${request.url} ${status} - ${exception.message}`, exception.stack);
        }
        else {
            this.logger.error(`${request.method} ${request.url} ${status} - ${JSON.stringify(message)}`);
        }
        response.status(status).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map