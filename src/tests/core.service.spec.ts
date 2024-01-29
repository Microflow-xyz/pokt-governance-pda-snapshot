import { Test, TestingModule } from '@nestjs/testing';
import { WinstonProvider } from '@common/winston/winston.provider';
import { CoreService } from '../core.service';
import { PDAService } from '../pda/pda.service';
import { ScoringService } from '../scoring/scoring.service';
import { StoreService } from '../store/store.service';

jest.mock('@common/winston/winston.provider');
jest.mock('../pda/pda.service');
// jest.mock('../scoring/scoring.service');
jest.mock('../store/store.service');

describe('CoreService', () => {
  let coreService: CoreService;
  let logger: WinstonProvider;
  let scoringService: ScoringService;
  let pdaService: PDAService;
  let storeService: StoreService;

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
    scoringService = module.get<ScoringService>(ScoringService);
    pdaService = module.get<PDAService>(PDAService);
    storeService = module.get<StoreService>(StoreService);

    jest.clearAllMocks();
  });
  test('Should be defined', () => {
    // Assert
    expect(coreService).toBeDefined();
  });

  describe('handler', () => {
    beforeEach(async () => {
      await coreService.handler();
    });
    test('Should be defined', () => {
      // Assert
      expect(coreService).toBeDefined();
    });
    test('Should Get all issued PDAs and call debug method from logger using all issued PDA ', async () => {
      await coreService.handler();
      expect(pdaService.getIssuedPDAs).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        'All issued PDAs:\n' + JSON.stringify([]),
        CoreService.name,
      );
    });
    test('Should calculate scores and call debug method from logger using scores', async () => {
      jest.spyOn(scoringService, 'calculateScores').mockReturnValue({});
      await coreService.handler();
      expect(scoringService.calculateScores).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        "All issued PDAs' scores:\n" + JSON.stringify({}),
        CoreService.name,
      );
    });
    test('Should Store Scores & PDAs and and call log method from logger using arweaveURL', async () => {
      await coreService.handler();
      expect(storeService.storeScores).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith(
        'The job executed',
        CoreService.name,
      );
      expect(logger.log).toHaveBeenCalledWith(
        `The job finished. storage URL is (arweaveBaseURL)`,
        CoreService.name,
      );
    });
  });
});
