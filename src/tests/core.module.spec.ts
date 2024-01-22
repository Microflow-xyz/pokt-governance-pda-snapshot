import { Test, TestingModule } from '@nestjs/testing';
import { CoreModule } from '../core.module';

describe('CoreModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CoreModule],
    }).compile();
  });

  test('should be defined', () => {
    // Assert
    expect(module).toBeDefined();
  });
});
