import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ArweaveProvider } from '@common/arweave/arweave.provider';
import { PDAScores } from '@common/interfaces/common.interface';
import { IssuedPDA } from '../../pda/interfaces/pda.interface';
import { ScoringDomainBlock } from '../../scoring/interfaces/scoring.interface';
import { StoreService } from '../store.service';

jest.mock('@common/arweave/arweave.provider');

describe('StoreService', () => {
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
    let scores: PDAScores<ScoringDomainBlock>;
    let PDA: IssuedPDA;
    beforeEach(() => {
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
      jest.spyOn(config, 'get').mockReturnValue('');
    });
    test('Should be defined', () => {
      // Assert
      expect(servise['storePDAsBlock']).toBeDefined();
    });

    test('Should call storeData when PDAs.length is not 0', () => {
      servise['storePDAsBlock'](scores);
      expect(arweave['storeData']).toHaveBeenCalled();
    });

    test('Should not call storeData when PDAs.length is 0', () => {
      // Arrange
      scores = {
        gatewayID: {
          citizen: {
            point: 0,
            PDAs: [],
          },
        },
      };
      // Act
      servise['storePDAsBlock'](scores);
      // Assert
      expect(arweave['storeData']).toHaveBeenCalledTimes(0);
    });

    test('Should call get method with correct parameter', () => {
      servise['storePDAsBlock'](scores);
      expect(config.get).toHaveBeenCalledWith('ARWEAVE_BASE_URL');
    });

    test('Should storeData when domain is "biulder"', () => {
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
      servise['storePDAsBlock'](scores);
      // Assert
      expect(arweave['storeData']).toHaveBeenCalled();
    });

    test('Should call storeData when domain is "staker(Validator)"', () => {
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
              point: 0,
              PDAs: [PDA],
            },
          },
        },
      };
      // Act
      servise['storePDAsBlock'](scores);
      // Assert
      expect(arweave['storeData']).toHaveBeenCalled();
    });

    test('Should call storeData when domain is "staker(gateway)', () => {
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
              point: 4,
              PDAs: [PDA],
            },
          },
        },
      };
      // Act
      servise['storePDAsBlock'](scores);
      // Assert
      expect(arweave['storeData']).toHaveBeenCalled();
    });
  });

  describe('storeScores', () => {
    let scores: PDAScores<ScoringDomainBlock>;
    beforeEach(() => {
      scores = {
        gatewayID: {
          citizen: {
            point: 0,
            PDAs: [],
          },
        },
      };
      jest.spyOn(config, 'get').mockReturnValue('');
    });
    test('Should be defined', () => {
      // Assert
      expect(servise.storeScores).toBeDefined();
    });
    test('Should call get method from config', () => {
      // Act
      servise.storeScores(scores);
      // Assert
      expect(config.get).toHaveBeenCalledWith('ARWEAVE_BASE_URL');
    });
    test('Should store scores and return the Arweave URL', async () => {
      // Arrange
      jest.spyOn(servise as any, 'storePDAsBlock').mockResolvedValue(undefined);
      const result = await servise.storeScores(scores);
      // Assert
      expect(servise['storePDAsBlock']).toHaveBeenCalledWith(scores);
      expect(arweave['storeData']).toHaveBeenCalledTimes(1);
      expect(result).toBe('mockedTransactionId');
    });
  });
});
