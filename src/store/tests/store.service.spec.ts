import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ArweaveProvider } from '@common/arweave/arweave.provider';
import { ArweaveTag } from '@common/arweave/interfaces/arweave.interface';
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
    expect(servise).toBeDefined();
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
      expect(servise['storePDAsBlock']).toBeDefined();
    });

    test('Should call get method with correct parameter', () => {
      servise['storePDAsBlock'](scores);
      expect(config.get).toHaveBeenCalledWith('ARWEAVE_BASE_URL');
    });

    test('Should not start loop when gatewayID is not in scores', async () => {
      scores = {};
      await servise['storePDAsBlock'](scores);
      expect(arweave.storeData).toHaveBeenCalledTimes(0);
    });

    test('Should call storeData method from arweaveProvider with correct parameters when citizenPDAs.length > 0 and update PDAs', async () => {
      await servise['storePDAsBlock'](scores);
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['gatewayID'].citizen.PDAs).toEqual(
        'arweaveBaseURL+mockedTransactionId',
      );
    });
    test('Should call storeData method from arweaveProvider with correct parameters when builderPDAs.length > 0 and update PDAs', async () => {
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 5,
            pdaType: 'builder',
            pdaSubtype: 'Socket Builder',
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
      await servise['storePDAsBlock'](scores);
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['gatewayID'].builder.PDAs).toEqual(
        'arweaveBaseURL+mockedTransactionId',
      );
    });

    test('Should call storeData method from arweaveProvider with correct parameters when validatorStakerPDAs.length > 0 and update PDAs', async () => {
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
              point: 2,
              PDAs: [PDA],
            },
          },
        },
      };
      await servise['storePDAsBlock'](scores);
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['gatewayID'].staker.validator.PDAs).toEqual(
        'arweaveBaseURL+mockedTransactionId',
      );
    });

    test('Should call storeData method from arweaveProvider with correct parameters when citizenPDAs.length > 0 and update PDAs', async () => {
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
      await servise['storePDAsBlock'](scores);
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['gatewayID'].staker.gateway.PDAs).toEqual(
        'arweaveBaseURL+mockedTransactionId',
      );
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
      expect(servise.storeScores).toBeDefined();
    });
    test('Should call get method from config', () => {
      servise.storeScores(scores);
      expect(config.get).toHaveBeenCalledWith('ARWEAVE_BASE_URL');
    });

    test('Should call storePDAsBlock with correct parameters', async () => {
      jest.spyOn(servise as any, 'storePDAsBlock').mockResolvedValue(undefined);
      await servise.storeScores(scores);
      expect(servise['storePDAsBlock']).toHaveBeenCalledWith(scores);
      expect(arweave['storeData']).toHaveBeenCalledTimes(1);
      expect(await servise.storeScores(scores)).toBe('mockedTransactionId');
    });
  });
});
