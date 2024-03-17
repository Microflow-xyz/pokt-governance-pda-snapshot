import { Test, TestingModule } from '@nestjs/testing';
import { PDAScores } from '@common/interfaces/common.interface';
import { WinstonProvider } from '@common/winston/winston.provider';
import { IssuedPDA } from '../../pda/interfaces/pda.interface';
import { PDAType, StakerPDASubType } from '../../pda/types/pda.type';
import { ScoringDomainBlock } from '../interfaces/scoring.interface';
import { ScoringService } from '../scoring.service';

// Mock the WinstonProvider
jest.mock('@common/winston/winston.provider');

// Describe the test suite for the ScoringService
describe('ScoringService', () => {
  let scoring: ScoringService;
  let logger: WinstonProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoringService, WinstonProvider],
    }).compile();

    scoring = module.get<ScoringService>(ScoringService);
    logger = module.get<WinstonProvider>(WinstonProvider);

    jest.clearAllMocks();
  });

  test('Should be defined', () => {
    expect(scoring).toBeDefined();
  });

  describe('appendETHVotingAddr', () => {
    let scoresOutput: PDAScores<ScoringDomainBlock>;
    let ETHVotingAddr: string;
    beforeEach(() => {
      scoresOutput = {};
      ETHVotingAddr = 'ETHVotingAddr';
    });
    test('Should append a new appendETHVotingAddr to scoresOutput', () => {
      // Act
      scoring['appendETHVotingAddr'](scoresOutput, ETHVotingAddr);
      // Assert
      expect(scoresOutput).toHaveProperty(ETHVotingAddr);
      expect(scoresOutput[ETHVotingAddr]).toEqual({});
    });
    test('Should not append an existing ETHVotingAddr to scoresOutput', () => {
      // Arrange
      const scoresOutput = {
        ETHVotingAddr: {
          citizen: {
            point: 0,
            PDAs: [],
          },
        },
      };
      // Act
      scoring['appendETHVotingAddr'](scoresOutput, ETHVotingAddr);
      // Assert
      expect(scoresOutput[ETHVotingAddr]).toEqual({
        citizen: {
          point: 0,
          PDAs: [],
        },
      });
    });
    test('Append multiple ETHVotingAddr to scoresOutput', () => {
      // Arrange
      const ETHVotingAddr2 = 'ETHVotingAddr2';
      // Act
      scoring['appendETHVotingAddr'](scoresOutput, ETHVotingAddr);
      scoring['appendETHVotingAddr'](scoresOutput, ETHVotingAddr2);
      // Assert
      expect(scoresOutput).toHaveProperty(ETHVotingAddr);
      expect(scoresOutput).toHaveProperty(ETHVotingAddr2);
      expect(scoresOutput[ETHVotingAddr]).toEqual({});
      expect(scoresOutput[ETHVotingAddr2]).toEqual({});
    });
  });

  describe('appendDomainBlock', () => {
    let scoresOutput: PDAScores<ScoringDomainBlock>;
    let domain: PDAType;
    let gatewayID: string;

    beforeEach(() => {
      scoresOutput = {
        gatewayID: {},
      };
      gatewayID = 'gatewayID';
    });

    test('Should be defined', () => {
      // Assert
      expect(scoring['appendDomainBlock']).toBeDefined();
    });
    test('should create a "citizen" domain block with correct parameters', () => {
      // Arrange
      domain = 'citizen';
      scoring['appendDomainBlock'](scoresOutput, gatewayID, domain);
      // Act
      expect(scoresOutput[gatewayID].citizen).toBeDefined();
      expect(scoresOutput[gatewayID].builder).toBeUndefined();
      expect(scoresOutput[gatewayID].staker).toBeUndefined();
      expect(scoresOutput[gatewayID].citizen).toEqual({ point: 0, PDAs: [] });
    });
    test('should create a "builder" domain block with correct parameters', () => {
      // Arrange
      domain = 'builder';
      // Act
      scoring['appendDomainBlock'](scoresOutput, gatewayID, domain);
      // Assert
      expect(scoresOutput[gatewayID].builder).toBeDefined();
      expect(scoresOutput[gatewayID].citizen).toBeUndefined();
      expect(scoresOutput[gatewayID].staker).toBeUndefined();
      expect(scoresOutput[gatewayID].builder).toEqual({ point: 0, PDAs: [] });
    });
    test('should create a "staker" domain block with correct parameters', () => {
      // Arrange
      domain = 'staker';
      // Act
      scoring['appendDomainBlock'](scoresOutput, gatewayID, domain);
      // Assert
      expect(scoresOutput[gatewayID].staker).toBeDefined();
      expect(scoresOutput[gatewayID].citizen).toBeUndefined();
      expect(scoresOutput[gatewayID].builder).toBeUndefined();
      expect(scoresOutput[gatewayID][domain]).toEqual({});
    });
    test('Should not append domain block if domain exists in gatewayID', () => {
      // Arrange
      scoresOutput = {
        gatewayID: {
          citizen: {
            point: 17,
            PDAs: [],
          },
        },
      };
      domain = 'citizen';
      // Act
      scoring['appendDomainBlock'](scoresOutput, gatewayID, domain);
      // Assert
      expect(scoresOutput[gatewayID][domain]).toEqual({
        point: 17,
        PDAs: [],
      });
    });
  });

  describe('appendStackerSubBlock', () => {
    let gatewayID: string;
    let scoresOutput: PDAScores<ScoringDomainBlock>;
    let subType: Lowercase<StakerPDASubType>;

    beforeEach(() => {
      gatewayID = 'gatewayID';
      scoresOutput = {
        gatewayID: {
          staker: {},
        },
      };
    });
    subType = 'validator';
    test('Should be defined', () => {
      expect(scoring['appendStackerSubBlock']).toBeDefined();
    });
    test(`should not add a new sub-block
     if subType already exists`, () => {
      // Arrange
      const PDA: IssuedPDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'staker',
            pdaSubtype: 'Gateway',
            type: 'custodian',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      scoresOutput = {
        gatewayID: {
          staker: {
            validator: {
              point: 17,
              PDAs: [PDA],
            },
          },
        },
      };
      // Act
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);
      // Assert
      expect(scoresOutput[gatewayID].staker[subType]).toEqual({
        point: 17,
        PDAs: [PDA],
      });
      expect(scoresOutput[gatewayID].staker.validator).toBeDefined();
    });
    test("should create a Sub-block with type 'validator'", () => {
      // Act
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);
      // Assert
      expect(scoresOutput[gatewayID].staker).toEqual({
        validator: { PDAs: [], point: 0 },
      });
      expect(scoresOutput[gatewayID].staker.validator).toBeDefined();
      expect(scoresOutput[gatewayID].staker.gateway).toBeUndefined();
    });
    test("should create a Sub-block with type 'gateway'", () => {
      // Arrange
      subType = 'gateway';
      // Act
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);
      // Assert
      expect(scoresOutput[gatewayID].staker).toEqual({
        gateway: { PDAs: [], point: 0 },
      });
      expect(scoresOutput[gatewayID].staker.gateway).toBeDefined();
      expect(scoresOutput[gatewayID].staker.validator).toBeUndefined();
    });
  });

  describe('calculateCitizensPoint', () => {
    let scoresOutput: PDAScores<ScoringDomainBlock>;
    let gatewayID: string;
    let PDA: IssuedPDA;

    beforeEach(() => {
      scoresOutput = {
        gatewayID: {
          citizen: {
            point: 0,
            PDAs: [],
          },
        },
      };
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'citizen',
            pdaSubtype: 'POKT DAO',
            votingAddress: 'votingAddress',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      gatewayID = 'gatewayID';
    });

    test('Should be defined', () => {
      // Assert
      expect(scoring['calculateCitizensPoint']).toBeDefined();
    });
    test('Should store related PDA', () => {
      // Act
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(scoresOutput[gatewayID].citizen.PDAs).toContain(PDA);
      expect(scoresOutput[gatewayID].citizen.PDAs[0]).toEqual(PDA);
    });
    test('Point should be 0 when citizen has no "POKT DNA"', () => {
      // Act
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(scoresOutput[gatewayID].citizen.PDAs).toContain(PDA);
      expect(scoresOutput[gatewayID].citizen.PDAs.length).toEqual(2);
      expect(scoresOutput[gatewayID].citizen.point).toEqual(0);
    });
    test('Point should be 0 when citizen has no "POKT DAO"', () => {
      // Arrange
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'citizen',
            pdaSubtype: 'POKT DNA',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(scoresOutput[gatewayID].citizen.PDAs).toContain(PDA);
      expect(scoresOutput[gatewayID].citizen.PDAs.length).toEqual(2);
      expect(scoresOutput[gatewayID].citizen.point).toEqual(0);
    });
    test('Point should be 1 when citizen has both "POKT DAO" and "POKT DNA"', () => {
      // Arrange
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'citizen',
            pdaSubtype: 'POKT DNA',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(scoresOutput[gatewayID].citizen.PDAs.length).toEqual(2);
      expect(scoresOutput[gatewayID].citizen.point).toEqual(1);
    });
    test('Should call error from logger when pdaSubtype is wrong', () => {
      // Arrange
      const fakePDA: any = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'citizen',
            pdaSubtype: 'fake pdaSubtype',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, fakePDA);
      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        `Invalid PDA sub type (fake pdaSubtype) for citizen`,
        ScoringService.name,
      );
    });
  });

  describe('calculateBuildersPoint', () => {
    let scoresOutput: PDAScores<ScoringDomainBlock>;
    let gatewayID: string;
    let PDA: IssuedPDA;

    beforeEach(() => {
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
      scoresOutput = {
        gatewayID: {
          builder: {
            point: 2,
            PDAs: [PDA],
          },
        },
      };
      gatewayID = 'gatewayID';
    });

    test('Should be defined', () => {
      // Assert
      expect(scoring['calculateBuildersPoint']).toBeDefined();
    });
    test('Should store related PDA', () => {
      // Act
      scoring['calculateBuildersPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(scoresOutput[gatewayID].builder.PDAs).toContain(PDA);
      expect(scoresOutput[gatewayID].builder.PDAs.length).toEqual(2);
      expect(scoresOutput[gatewayID].builder.point).toEqual(2);
    });
    test('Should add PDA if it does not exist', () => {
      // Arrange
      scoresOutput = {
        gatewayID: {
          builder: {
            point: 2,
            PDAs: [],
          },
        },
      };
      // Act
      scoring['calculateBuildersPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(scoresOutput[gatewayID].builder.PDAs).toContain(PDA);
      expect(scoresOutput[gatewayID].builder.PDAs.length).toEqual(1);
      expect(scoresOutput[gatewayID].builder.point).toEqual(2);
    });
    test('Should update max value for each builder subType', () => {
      // Arrange
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 3,
            pdaType: 'builder',
            pdaSubtype: 'Bounty Hunter',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      scoring['calculateBuildersPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      const pointer = scoresOutput[gatewayID].builder;
      expect(pointer.point).toEqual(3);
      expect(pointer.PDAs.length).toEqual(2);
    });
    test('Should calculate total points correctly', () => {
      // Arrange
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 3,
            pdaType: 'builder',
            pdaSubtype: 'DAO Scholar',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      scoring['calculateBuildersPoint'](scoresOutput, gatewayID, PDA);
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 3,
            pdaType: 'builder',
            pdaSubtype: 'Socket Builder',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      scoring['calculateBuildersPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      const pointer = scoresOutput[gatewayID].builder;
      expect(pointer.point).toEqual(8);
      expect(pointer.PDAs.length).toEqual(3);
    });
    test('Should set point equal 10 if point is greater than 10', () => {
      // Arrange
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 9,
            pdaType: 'builder',
            pdaSubtype: 'Socket Builder',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      scoring['calculateBuildersPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      const pointer = scoresOutput[gatewayID].builder;
      expect(pointer.point).toEqual(10);
      expect(pointer.PDAs.length).toEqual(2);
    });
    test('Should call error from logger when pdaSubtype is wrong', () => {
      // Arrange
      const fakePDA: any = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 8,
            pdaType: 'builder',
            pdaSubtype: 'fake pdaSubtype',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      scoring['calculateBuildersPoint'](scoresOutput, gatewayID, fakePDA);
      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        `Invalid PDA sub type (fake pdaSubtype) for builder`,
        ScoringService.name,
      );
    });
  });

  describe('calculateStakersPoint', () => {
    let scoresOutput: PDAScores<ScoringDomainBlock>;
    let gatewayID: string;
    let PDA: IssuedPDA;

    beforeEach(() => {
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
      scoresOutput = {
        gatewayID: {
          staker: {
            validator: {
              point: 0,
              PDAs: [],
            },
          },
        },
      };
      gatewayID = 'gatewayID';
    });

    test('Should be defined', () => {
      // Assert
      expect(scoring['calculateStakersPoint']).toBeDefined();
    });
    test('Should store related PDA', () => {
      // Act
      scoring['calculateStakersPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(scoresOutput[gatewayID].staker.validator.PDAs).toContain(PDA);
      expect(scoresOutput[gatewayID].staker.validator.PDAs.length).toEqual(1);
    });
    test(`The square root of the sum of PDA points should be assigned as the point value
          when the PDA_SUB_TYPE is equal to 'validator'`, () => {
      // Act
      scoring['calculateStakersPoint'](scoresOutput, gatewayID, PDA);
      const pointer = scoresOutput[gatewayID].staker.validator;
      // Assert
      expect(pointer.point).toEqual(2);
    });
    test(`Sum of PDA points should be assigned as the point value
          when the PDA_SUB_TYPE is equal to 'gateway'`, () => {
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
      scoresOutput = {
        gatewayID: {
          staker: {
            gateway: {
              point: 4,
              PDAs: [
                {
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
                },
              ],
            },
          },
        },
      };
      // Act
      scoring['calculateStakersPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      const pointer = scoresOutput[gatewayID].staker.gateway;
      expect(pointer.point).toEqual(8);
      expect(pointer.PDAs.length).toEqual(2);
    });
    test('Should call error from logger when pdaSubtype is wrong', () => {
      //Arange
      const fakePDA: any = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 4,
            pdaType: 'staker',
            pdaSubtype: 'fake pdaSubtype',
            type: 'custodian',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      scoring['calculateStakersPoint'](scoresOutput, gatewayID, fakePDA);
      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        `Invalid PDA sub type (fake pdasubtype) for staker`,
        ScoringService.name,
      );
    });
  });

  describe('calculateScores', () => {
    let PDA: IssuedPDA;
    let returnValue: PDAScores<ScoringDomainBlock>;
    beforeEach(() => {
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'citizen',
            pdaSubtype: 'POKT DAO',
            votingAddress: 'votingAddress',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
    });

    test('Should be defined', () => {
      // Assert
      expect(scoring.calculateScores).toBeDefined();
    });
    test(`Should call appendETHVotingAddr and add ETHVotingAddr to scoresOutput
          for a user that has "citizen" PDA with "DAO" subType`, () => {
      // Act
      returnValue = scoring.calculateScores([PDA]);
      // Assert
      expect(returnValue['votingAddress']).toBeDefined();
    });

    test(`Should call appendDomainBlock and calculateCitizensPoint
          when PDA_TYPE is 'citizen', then add PDA to scoresOutput,
          calculate points and append to scoresOutput`, () => {
      // Arrange
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'citizen',
            pdaSubtype: 'POKT DAO',
            votingAddress: 'votingAddress',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      returnValue = scoring.calculateScores([PDA]);
      const pointer = returnValue['votingAddress'];
      // Assert
      expect(pointer.citizen).toBeDefined();
      expect(pointer.citizen.point).toEqual(0);
      expect(pointer.citizen.PDAs.length).toEqual(1);
      expect(pointer.builder).toBeUndefined();
      expect(pointer.staker).toBeUndefined();
    });

    test(`Should call appendDomainBlock and calculateBuildersPoint
          when PDA_TYPE is 'builder', then add PDA to scoresOutput, 
          calculate points and append to scoresOutput for a user that 
          has PDA with DAO Quest before`, () => {
      // Arrange
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
      // Act
      returnValue = scoring.calculateScores([PDA, builderPDA]);
      const pointer = returnValue['votingAddress'];
      // Assert
      expect(pointer.builder).toBeDefined();
      expect(pointer.builder.point).toEqual(2);
      expect(pointer.builder.PDAs.length).toEqual(1);
      expect(pointer.citizen).toBeDefined();
      expect(pointer.staker).toBeUndefined();
    });

    test(`Should call appendDomainBlock and calculateStakersPoint
          when PDA_TYPE is 'staker', then add PDA to scoresOutput,
          calculate points and append to scoresOutput for a user that 
          has PDA with DAO Quest before`, () => {
      // Arrange
      const stakerPDA: IssuedPDA = {
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
      // Act
      returnValue = scoring.calculateScores([PDA, stakerPDA]);
      const pointer = returnValue['votingAddress'];
      // Assert
      expect(pointer.staker.validator).toBeDefined();
      expect(pointer.staker.validator.point).toEqual(2);
      expect(pointer.staker.validator.PDAs.length).toEqual(1);
      expect(pointer.citizen).toBeDefined();
      expect(pointer.builder).toBeUndefined();
    });
    test('Should call error from logger when pdaType is wrong', () => {
      // Arrange
      const fakePDA: any = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 4,
            pdaType: 'fake pdaType',
            pdaSubtype: 'Validator',
            type: 'custodian',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      scoring.calculateScores([PDA, fakePDA]);
      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        `Unknown PDA type (fake pdaType) exists`,
        ScoringService.name,
      );
    });
  });
});
