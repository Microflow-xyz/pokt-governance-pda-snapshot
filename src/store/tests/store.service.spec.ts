import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import moment from 'moment';
import { ArweaveProvider } from '@common/arweave/arweave.provider';
import { ArweaveTag } from '@common/arweave/interfaces/arweave.interface';
import { PDAScores } from '@common/interfaces/common.interface';
import { IssuedPDA } from '../../pda/interfaces/pda.interface';
import { ScoringDomainBlock } from '../../scoring/interfaces/scoring.interface';
import { StoreService } from '../store.service';

// Mock the ArweaveProvider
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
            point: 1,
            pdaType: 'citizen',
            votingAddress: 'votingAddress',
            pdaSubtype: 'POKT DAO',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      scores = {
        votingAddress: {
          citizen: {
            point: 0,
            PDAs: [PDA],
          },
        },
      };
      jest.spyOn(config, 'get').mockReturnValue('http://example.com/');
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

    test('Should not start loop when ETHWalletAddr is not in scores', async () => {
      // Arrange
      scores = {};
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(0);
    });

    test('Should call storeData method from arweaveProvider with correct parameters when citizenPDAs.length > 0 and set citizenPDAs to a URL', async () => {
      // Arrange
      jest.spyOn(arweave, 'storeData').mockResolvedValue('citizenTDX_id');
      // Act
      await service['storePDAsBlock'](scores);
      // Assert)
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['votingAddress'].citizen.PDAs).toEqual(
        'http://example.com/citizenTDX_id',
      );
    });
    test('Should call storeData method from arweaveProvider with correct parameters when builderPDAs.length > 0 and set builderPDAs to a URL', async () => {
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
        votingAddress: {
          builder: {
            point: 2,
            PDAs: [PDA],
          },
        },
      };
      jest.spyOn(arweave, 'storeData').mockResolvedValue('builderTDX_id');
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['votingAddress'].builder.PDAs).toEqual(
        'http://example.com/builderTDX_id',
      );
    });
    test('Should call storeData method from arweaveProvider with correct parameters when validatorStakerPDAs.length > 0 and set validatorStakerPDAs to a URL', async () => {
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
        votingAddress: {
          staker: {
            validator: {
              point: 4,
              PDAs: [PDA],
            },
          },
        },
      };
      jest
        .spyOn(arweave, 'storeData')
        .mockResolvedValue('stakerValidatorTDX_id');
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['votingAddress'].staker.validator.PDAs).toEqual(
        'http://example.com/stakerValidatorTDX_id',
      );
    });
    test('Should call storeData method from arweaveProvider with correct parameters when gatewayStakerPDAs.length > 0 and set gatewayStakerPDAs to a URL', async () => {
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
        votingAddress: {
          staker: {
            gateway: {
              point: 4,
              PDAs: [PDA],
            },
          },
        },
      };
      jest.spyOn(arweave, 'storeData').mockResolvedValue('stakerGatewayTDX_id');
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['votingAddress'].staker.gateway.PDAs).toEqual(
        'http://example.com/stakerGatewayTDX_id',
      );
    });
    test('Should call storeData method from arweaveProvider with correct parameters when Liquidity_ProviderStakerPDAs.length > 0 and set Liquidity_ProviderStakerPDAs to a URL', async () => {
      // Arrange
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 4,
            pdaType: 'staker',
            pdaSubtype: 'Liquidity Provider',
            type: 'custodian',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      scores = {
        votingAddress: {
          staker: {
            'liquidity provider': {
              point: 4,
              PDAs: [PDA],
            },
          },
        },
      };
      jest
        .spyOn(arweave, 'storeData')
        .mockResolvedValue('stakerLiquidity_ProviderTDX_id');
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(1);
      expect(arweave.storeData).toHaveBeenCalledWith([PDA], tags);
      expect(scores['votingAddress'].staker['liquidity provider'].PDAs).toEqual(
        'http://example.com/stakerLiquidity_ProviderTDX_id',
      );
    });
    test('Should call storeData method from arweaveProvider with correct parameters for a User who has staker, builder and citizen PDAs and set URLs', async () => {
      // Arrange
      const stakerValidatorPDA: IssuedPDA = {
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
      const builderPDA: IssuedPDA = {
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
      const citizenPOKTDNA_PDA: IssuedPDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 1,
            pdaType: 'citizen',
            pdaSubtype: 'POKT DNA',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      scores = {
        votingAddress: {
          citizen: {
            point: 1,
            PDAs: [PDA, citizenPOKTDNA_PDA],
          },
          staker: {
            validator: {
              point: 4,
              PDAs: [stakerValidatorPDA],
            },
          },
          builder: {
            point: 2,
            PDAs: [builderPDA],
          },
        },
      };
      jest.spyOn(arweave, 'storeData').mockResolvedValueOnce('citizenTDX_id');
      jest.spyOn(arweave, 'storeData').mockResolvedValueOnce('builderTDX_id');
      jest
        .spyOn(arweave, 'storeData')
        .mockResolvedValueOnce('stakerValidatorTDX_id');
      // Act
      await service['storePDAsBlock'](scores);
      // Assert
      expect(arweave.storeData).toHaveBeenCalledTimes(3);
      expect(arweave.storeData).toHaveBeenCalledWith(
        [PDA, citizenPOKTDNA_PDA],
        tags,
      );
      expect(arweave.storeData).toHaveBeenCalledWith([builderPDA], tags);
      expect(arweave.storeData).toHaveBeenCalledWith(
        [stakerValidatorPDA],
        tags,
      );
      expect(scores['votingAddress'].staker.validator.PDAs).toEqual(
        'http://example.com/stakerValidatorTDX_id',
      );
      expect(scores['votingAddress'].builder.PDAs).toEqual(
        'http://example.com/builderTDX_id',
      );
      expect(scores['votingAddress'].citizen.PDAs).toEqual(
        'http://example.com/citizenTDX_id',
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

      jest.spyOn(config, 'get').mockReturnValue('http://example.com/');
      jest.spyOn(arweave, 'storeData').mockResolvedValue('transaction_id');
      jest.spyOn(service as any, 'storePDAsBlock');
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
    test('Should returtn "http://example.com/transaction_id" ', async () => {
      // Act
      returnValue = await service.storeScores(scores);
      // Assert
      expect(returnValue).toEqual('http://example.com/transaction_id');
    });
  });
});
