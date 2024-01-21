import { Test, TestingModule } from '@nestjs/testing';
import { CoreModule } from '../core.module';

describe('CoreModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CoreModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
