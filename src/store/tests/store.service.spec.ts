import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ArweaveProvider } from '@common/arweave/arweave.provider';
import { ArweaveTag } from '@common/arweave/interfaces/arweave.interface';
import { PDAScores } from '@common/interfaces/common.interface';
import { IssuedPDA } from '../../pda/interfaces/pda.interface';
import { ScoringDomainBlock } from '../../scoring/interfaces/scoring.interface';
import { StoreService } from '../store.service';

// Mock the ArweaveProvider module
jest.mock('@common/arweave/arweave.provider');

// Describe the test suite for the StoreService
describe('StoreService', () => {
  let service: StoreService;
  let config: ConfigService;
  let arweave: ArweaveProvider;

  // Setup before each test
  beforeEach(async () => {
    // Create a testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreService, ConfigService, ArweaveProvider],
    }).compile();

    // Initialize instances for testing
    service = module.get<StoreService>(StoreService);
    config = module.get<ConfigService>(ConfigService);
    arweave = module.get<ArweaveProvider>(ArweaveProvider);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Basic test to check if the service is defined
  test('Should be defined', () => {
    expect(service).toBeDefined();
  });

  // Describe the 'storePDAsBlock' method tests
  describe('storePDAsBlock', () => {
    let scores: PDAScores<ScoringDomainBlock>;
    let PDA: IssuedPDA;
    let tags: Array<ArweaveTag>;

    // Setup before each test
    beforeEach(() => {
      // Mocked tags for Arweave
      tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Application-ID', value: 'POKT-NETWORK-PDA-SCORING-SYSTEM' },
        { name: 'Data-ID', value: 'PDAs' },
      ];

      // Mocked IssuedPDA and scores
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'citizen',
            pdaSubtype: 'POKT DAO',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      scores = {
        gatewayID: {
          citizen: {
            point: 0,
            PDAs: [PDA],
          },
        },
      };

      // Mocked methods and configurations
      jest.spyOn(config, 'get').mockReturnValue('arweaveBaseURL+');
      jest.spyOn(arweave, 'storeData').mockResolvedValue('mockedTransactionId');
    });

    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(service['storePDAsBlock']).toBeDefined();
    });

    // Test to check if the method calls get method with correct parameter
    test('Should call get method with correct parameter', () => {
      service['storePDAsBlock'](scores);
      expect(config.get).toHaveBeenCalledWith('ARWEAVE_BASE_URL');
    });

    // Test to check if the method does not start the loop when gatewayID is not in scores
    test('Should not start loop when gatewayID is not in scores', async () => {
      scores = {};
      await service['storePDAsBlock'](scores);
      expect(arweave.storeData).toHaveBeenCalledTimes(0);
    });

    // Test to check if the method calls storeData method from arweaveProvider with correct parameters when citizenPDAs.length > 0 and update PDAs
    test('Should call storeData method from arweaveProvider with correct parameters when citizenPDAs.length > 0 and update PDAs', async () => {
      await service['storePDAsBlock'](scores);
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['gatewayID'].citizen.PDAs).toEqual(
        'arweaveBaseURL+mockedTransactionId',
      );
    });

    // ... Additional similar tests for other PDA types ...
  });

  // Describe the 'storeScores' method tests
  describe('storeScores', () => {
    let scores: PDAScores<ScoringDomainBlock>;

    // Setup before each test
    beforeEach(() => {
      // Mocked scores
      scores = {
        gatewayID: {
          citizen: {
            point: 0,
            PDAs: [],
          },
        },
      };

      // Mocked method and configuration
      jest.spyOn(config, 'get').mockReturnValue('');
    });

    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(service.storeScores).toBeDefined();
    });

    // Test to check if the method calls get method from config
    test('Should call get method from config', () => {
      service.storeScores(scores);
      expect(config.get).toHaveBeenCalledWith('ARWEAVE_BASE_URL');
    });

    // Test to check if the method calls storePDAsBlock with correct parameters
    test('Should call storePDAsBlock with correct parameters', async () => {
      jest.spyOn(service as any, 'storePDAsBlock').mockResolvedValue(undefined);
      await service.storeScores(scores);
      expect(service['storePDAsBlock']).toHaveBeenCalledWith(scores);
      expect(arweave['storeData']).toHaveBeenCalledTimes(1);
      expect(await service.storeScores(scores)).toBe('mockedTransactionId');
    });
  });
});
