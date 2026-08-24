"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
let AppService = class AppService {
    getHello() {
        return {
            name: 'Jumuiya System',
            status: 'online',
            architecture: {
                frontend: 'web experience',
                backend: 'api services',
            },
            modules: ['home', 'about', 'resources', 'news', 'events', 'contact'],
            features: [
                'public website and content pages',
                'news and updates management',
                'event promotion and registration flow',
                'resource and blueprint publishing',
                'partner and contact intake',
                'secure admin authentication',
            ],
            legacyMapping: {
                website: 'front-end presentation layer',
                cms: 'content operations and management',
                admin: 'secure authenticated portal',
            },
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map