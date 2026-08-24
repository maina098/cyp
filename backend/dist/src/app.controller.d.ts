import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): {
        name: string;
        status: string;
        architecture: {
            frontend: string;
            backend: string;
        };
        modules: string[];
        features: string[];
        legacyMapping: {
            website: string;
            cms: string;
            admin: string;
        };
    };
}
