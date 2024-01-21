import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { PDAModule } from '../pda.module';
import { PDAService } from '../pda.service';

jest.mock('../pda.service');

describe('PDAModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [HttpModule, PDAModule],
    }).compile();
  });

  test('should be defined', () => {
    expect(module).toBeDefined();
  });

  test('should provide PDAService', () => {
    const pdaService = module.get<PDAService>(PDAService);
    expect(pdaService).toBeDefined();
    expect(pdaService['getIssuedPDAsGQL']()).toBe('mockedValue');
  });
});
