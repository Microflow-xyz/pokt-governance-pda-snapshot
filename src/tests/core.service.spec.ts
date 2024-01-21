import { Test, TestingModule } from '@nestjs/testing';
import { WinstonProvider } from '@common/winston/winston.provider';
import { CoreService } from '../core.service';
import { PDAService } from '../pda/pda.service';
import { ScoringService } from '../scoring/scoring.service';
import { StoreService } from '../store/store.service';

jest.mock('@common/winston/winston.provider');
jest.mock('../pda/pda.service');
jest.mock('../scoring/scoring.service');
jest.mock('../store/store.service');

describe('CoreService', () => {
  let coreService: CoreService;
  let logger: WinstonProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreService,
        PDAService,
        WinstonProvider,
        ScoringService,
        StoreService,
      ],
    }).compile();

    coreService = module.get<CoreService>(CoreService);
    logger = module.get<WinstonProvider>(WinstonProvider);

    jest.clearAllMocks();
  });
  test('Should be defined', () => {
    expect(coreService).toBeDefined();
  });

  describe('handler', () => {
    beforeEach(async () => {
      await coreService.handler();
    });
    test('Should be defined', () => {
      expect(coreService).toBeDefined();
    });
    test('Should call log method from logger', () => {
      expect(logger.log).toHaveBeenCalledTimes(2);
    });
    test('Should call debug method from logger', () => {
      expect(logger.debug).toHaveBeenCalledTimes(2);
    });
  });
});
