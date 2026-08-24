import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
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
}
