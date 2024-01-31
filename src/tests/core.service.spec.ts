import { Test, TestingModule } from '@nestjs/testing';
import { WinstonProvider } from '@common/winston/winston.provider';
import { CoreService } from '../core.service';
import { PDAService } from '../pda/pda.service';
import { ScoringService } from '../scoring/scoring.service';
import { StoreService } from '../store/store.service';

// Mock necessary modules and services
jest.mock('@common/winston/winston.provider');
jest.mock('../pda/pda.service');
jest.mock('../store/store.service');

// Describe the test suite for the CoreService
describe('CoreService', () => {
  let coreService: CoreService;
  let logger: WinstonProvider;
  let scoringService: ScoringService;
  let pdaService: PDAService;
  let storeService: StoreService;

  // Setup before each test
  beforeEach(async () => {
    // Create a testing module with the required providers
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreService,
        PDAService,
        WinstonProvider,
        ScoringService,
        StoreService,
      ],
    }).compile();

    // Initialize instances for testing
    coreService = module.get<CoreService>(CoreService);
    logger = module.get<WinstonProvider>(WinstonProvider);
    scoringService = module.get<ScoringService>(ScoringService);
    pdaService = module.get<PDAService>(PDAService);
    storeService = module.get<StoreService>(StoreService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Basic test to check if the service is defined
  test('Should be defined', () => {
    expect(coreService).toBeDefined();
  });

  // Describe the 'handler' method tests
  describe('handler', () => {
    // Setup before each test
    beforeEach(async () => {
      await coreService.handler();
    });

    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(coreService).toBeDefined();
    });

    // Test to check if the method calls getIssuedPDAs method from PDAService and debug method from logger
    test('Should Get all issued PDAs and call debug method from logger using all issued PDA', async () => {
      await coreService.handler();
      expect(pdaService.getIssuedPDAs).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        'All issued PDAs:\n' + JSON.stringify([]),
        CoreService.name,
      );
    });

    // Test to check if the method calls calculateScores method from ScoringService and debug method from logger
    test('Should calculate scores and call debug method from logger using scores', async () => {
      jest.spyOn(scoringService, 'calculateScores').mockReturnValue({});
      await coreService.handler();
      expect(scoringService.calculateScores).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalledWith(
        "All issued PDAs' scores:\n" + JSON.stringify({}),
        CoreService.name,
      );
    });

    // Test to check if the method calls storeScores method from StoreService and log method from logger
    test('Should Store Scores and PDAs and and call log method from logger using arweaveURL', async () => {
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
