export declare class AppService {
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
