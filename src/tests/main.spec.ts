import { Test, TestingModule } from '@nestjs/testing';
import { WinstonProvider } from '@common/winston/winston.provider';
import { CoreModule } from '../core.module';

describe('Main', () => {
  let app;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CoreModule],
    }).compile();

    app = module.createNestApplication();
    app.useLogger(app.get(WinstonProvider));
  });

  test('should be defined', () => {
    // Assert
    expect(app).toBeDefined();
  });
});
