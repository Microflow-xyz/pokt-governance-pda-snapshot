import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import moment from 'moment';
import { ArweaveProvider } from '@common/arweave/arweave.provider';
import { ArweaveTag } from '@common/arweave/interfaces/arweave.interface';
import { PDAScores } from '@common/interfaces/common.interface';
import { IssuedPDA } from '../../pda/interfaces/pda.interface';
import { ScoringDomainBlock } from '../../scoring/interfaces/scoring.interface';
import { StoreService } from '../store.service';

// Mock the WinstonProvider
jest.mock('@common/arweave/arweave.provider');

// Describe the test suite for the StoreService
describe('StoreService', () => {
  let service: StoreService;
  let config: ConfigService;
  let arweave: ArweaveProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreService, ConfigService, ArweaveProvider],
    }).compile();

    service = module.get<StoreService>(StoreService);
    config = module.get<ConfigService>(ConfigService);
    arweave = module.get<ArweaveProvider>(ArweaveProvider);

    jest.clearAllMocks();
  });

  test('Should be defined', () => {
    // Assert
    expect(service).toBeDefined();
  });

  describe('storePDAsBlock', () => {
    let scores: PDAScores<ScoringDomainBlock>;
    let PDA: IssuedPDA;
    let tags: Array<ArweaveTag>;

    beforeEach(() => {
      tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Application-ID', value: 'POKT-NETWORK-PDA-SCORING-SYSTEM' },
        { name: 'Data-ID', value: 'PDAs' },
      ];
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

      jest.spyOn(config, 'get').mockReturnValue('arweaveBaseURL+');
      jest.spyOn(arweave, 'storeData').mockResolvedValue('mockedTransactionId');
    });

    test('Should be defined', () => {
      // Assert
      expect(service['storePDAsBlock']).toBeDefined();
    });

    test('Should call get method with correct parameter', () => {
      // Act
      service['storePDAsBlock'](scores);
      // Assert
      expect(config.get).toHaveBeenCalledWith('ARWEAVE_BASE_URL');
    });

    test('Should not start loop when gatewayID is not in scores', async () => {
      // Arrange
      scores = {};
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(0);
    });

    test('Should call storeData method from arweaveProvider with correct parameters when citizenPDAs.length > 0 and update PDAs', async () => {
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['gatewayID'].citizen.PDAs).toEqual(
        'arweaveBaseURL+mockedTransactionId',
      );
    });
    test('Should call storeData method from arweaveProvider with correct parameters when builderPDAs.length > 0 and update PDAs', async () => {
      // Arrange
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 2,
            pdaType: 'builder',
            pdaSubtype: 'Bounty Hunter',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      scores = {
        gatewayID: {
          builder: {
            point: 2,
            PDAs: [PDA],
          },
        },
      };
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['gatewayID'].builder.PDAs).toEqual(
        'arweaveBaseURL+mockedTransactionId',
      );
    });
    test('Should call storeData method from arweaveProvider with correct parameters when validatorStakerPDAs.length > 0 and update PDAs', async () => {
      // Arrange
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 4,
            pdaType: 'staker',
            pdaSubtype: 'Validator',
            type: 'custodian',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      scores = {
        gatewayID: {
          staker: {
            validator: {
              point: 4,
              PDAs: [PDA],
            },
          },
        },
      };
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['gatewayID'].staker.validator.PDAs).toEqual(
        'arweaveBaseURL+mockedTransactionId',
      );
    });
    test('Should call storeData method from arweaveProvider with correct parameters when gatewayStakerPDAs.length > 0 and update PDAs', async () => {
      // Arrange
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 4,
            pdaType: 'staker',
            pdaSubtype: 'Gateway',
            type: 'custodian',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      scores = {
        gatewayID: {
          staker: {
            gateway: {
              point: 0,
              PDAs: [PDA],
            },
          },
        },
      };
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['gatewayID'].staker.gateway.PDAs).toEqual(
        'arweaveBaseURL+mockedTransactionId',
      );
    });
  });

  describe('storeScores', () => {
    let scores: PDAScores<ScoringDomainBlock>;
    let tags: Array<ArweaveTag>;
    let returnValue;
    beforeEach(() => {
      const startTimeOfYesterday = moment().utc().add(-1, 'day').startOf('day');
      tags = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Application-ID', value: 'POKT-NETWORK-PDA-SCORING-SYSTEM' },
        { name: 'Data-ID', value: 'PDAs-SCORES' },
        { name: 'Unix-Timestamp', value: String(startTimeOfYesterday.unix()) },
      ];
      scores = {
        gatewayID: {
          citizen: {
            point: 0,
            PDAs: [],
          },
        },
      };

      jest.spyOn(config, 'get').mockReturnValue('ARWEAVE_BASE_URL+');
      jest.spyOn(arweave, 'storeData').mockResolvedValue('transaction_id');
      jest.spyOn(service as any, 'storePDAsBlock').mockResolvedValue(undefined);
    });

    test('Should be defined', () => {
      // Assert
      expect(service.storeScores).toBeDefined();
    });

    test('Should call get method from config', () => {
      // Act
      service.storeScores(scores);
      // Assert
      expect(config.get).toHaveBeenCalledWith('ARWEAVE_BASE_URL');
    });

    test('Should call storePDAsBlock with correct parameters', async () => {
      // Act
      await service.storeScores(scores);
      // Assert
      expect(service['storePDAsBlock']).toHaveBeenCalledWith(scores);
      expect(arweave['storeData']).toHaveBeenCalledTimes(1);
    });
    test('Should call storeData method from arweaveProvider with correct parameters', async () => {
      // Act
      await service.storeScores(scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledWith(scores, tags);
    });
    test('Should returtn "arweaveBaseURL + transaction_id" ', async () => {
      // Act
      returnValue = await service.storeScores(scores);
      // Assert
      expect(returnValue).toEqual('ARWEAVE_BASE_URL+transaction_id');
    });
  });
});
