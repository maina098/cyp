"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma.module");
const auth_module_1 = require("./auth/auth.module");
const content_module_1 = require("./content/content.module");
const admin_module_1 = require("./admin/admin.module");
const contact_module_1 = require("./contact/contact.module");
const elections_module_1 = require("./elections/elections.module");
const votes_module_1 = require("./votes/votes.module");
const positions_module_1 = require("./positions/positions.module");
const applications_module_1 = require("./applications/applications.module");
const health_module_1 = require("./health/health.module");
const users_module_1 = require("./users/users.module");
const appImports = [
    prisma_module_1.PrismaModule,
    auth_module_1.AuthModule,
    content_module_1.ContentModule,
    admin_module_1.AdminModule,
    contact_module_1.ContactModule,
    elections_module_1.ElectionsModule,
    votes_module_1.VotesModule,
    positions_module_1.PositionsModule,
    applications_module_1.ApplicationsModule,
    users_module_1.UsersModule,
];
let AppModule = class AppModule {
    static imports = appImports;
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60_000,
                    limit: 100,
                },
            ]),
            health_module_1.HealthModule,
            ...appImports,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map