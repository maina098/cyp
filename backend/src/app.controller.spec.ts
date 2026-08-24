import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the redesigned system overview', () => {
      const response = appController.getHello();

      expect(response).toMatchObject({
        name: 'Jumuiya System',
        status: 'online',
        architecture: {
          frontend: 'web experience',
          backend: 'api services',
        },
      });
      expect(response.modules).toEqual(expect.arrayContaining([
        'home',
        'about',
        'resources',
        'news',
        'events',
        'contact',
      ]));
    });
  });
});
