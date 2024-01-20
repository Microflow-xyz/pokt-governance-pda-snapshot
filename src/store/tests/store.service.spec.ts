import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ArweaveProvider } from '@common/arweave/arweave.provider';
import { StoreService } from '../store.service';

jest.mock('@common/arweave/arweave.provider');

describe('store.service', () => {
  let servise: StoreService;
  let config: ConfigService;
  let arweave: ArweaveProvider;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreService, ConfigService, ArweaveProvider],
    }).compile();
    servise = module.get<StoreService>(StoreService);
    config = module.get<ConfigService>(ConfigService);
    arweave = module.get<ArweaveProvider>(ArweaveProvider);

    jest.clearAllMocks();
  });
  test('Should be defined', () => {
    // Assert
    expect(servise).toBeDefined();
  });

  describe('storePDAsBlock', () => {
    test('Should be defined', () => {
      // Assert
      expect(servise['storePDAsBlock']).toBeDefined();
    });
  });
});
