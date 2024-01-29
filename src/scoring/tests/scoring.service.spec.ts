import { Test, TestingModule } from '@nestjs/testing';
import { PDAScores } from '@common/interfaces/common.interface';
import { WinstonProvider } from '@common/winston/winston.provider';
import { IssuedPDA } from '../../pda/interfaces/pda.interface';
import { PDAType, StakerPDASubType } from '../../pda/types/pda.type';
import { ScoringDomainBlock } from '../interfaces/scoring.interface';
import { ScoringService } from '../scoring.service';

jest.mock('@common/winston/winston.provider');

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
    // Assert
    expect(scoring).toBeDefined();
  });

  describe('appendGatewayID', () => {
    let ScoresOutput: PDAScores<ScoringDomainBlock>;
    let gatewayID: string;
    beforeEach(() => {
      ScoresOutput = {};
      gatewayID = 'gatewayID';
    });
    test('Should append a new gatewayID to scoresOutput', () => {
      scoring['appendGatewayID'](ScoresOutput, gatewayID);
      // Assert
      expect(ScoresOutput).toHaveProperty(gatewayID);
      expect(ScoresOutput[gatewayID]).toEqual({});
    });

    test('Should not append an existing gatewayID to scoresOutput', () => {
      // Arrange
      ScoresOutput = {
        gatewayID: {
          citizen: {
            point: 0,
            PDAs: [],
          },
        },
      };
      const scoresOutput = ScoresOutput;
      // Act
      scoring['appendGatewayID'](scoresOutput, gatewayID);
      // Assert
      expect(scoresOutput[gatewayID]).toEqual({
        citizen: {
          point: 0,
          PDAs: [],
        },
      });
    });
    test('Append multiple GatewayIDs to scoresOutput', () => {
      const gatewayID2 = 'gatewayID2';
      // Act
      scoring['appendGatewayID'](ScoresOutput, gatewayID);
      scoring['appendGatewayID'](ScoresOutput, gatewayID2);
      // Assert
      expect(ScoresOutput).toHaveProperty(gatewayID);
      expect(ScoresOutput).toHaveProperty(gatewayID2);
      expect(ScoresOutput[gatewayID]).toEqual({});
      expect(ScoresOutput[gatewayID2]).toEqual({});
    });
  });

  describe('appendDomainBlock', () => {
    let ScoresOutput: PDAScores<ScoringDomainBlock>;
    let domain: PDAType;
    let gatewayID: string;

    beforeEach(() => {
      ScoresOutput = {
        gatewayID: {},
      };
      gatewayID = 'gatewayID';
    });

    test('Should be defined', () => {
      // Assert
      expect(scoring['appendDomainBlock']).toBeDefined();
    });

    test('should create a domain block with type "citizen"', () => {
      // Arrange
      domain = 'citizen';
      // Act
      scoring['appendDomainBlock'](ScoresOutput, gatewayID, domain);
      // Assert
      expect(ScoresOutput[gatewayID][domain]).toEqual({
        point: 0,
        PDAs: [],
      });
    });

    test('Should create a domain block with type "builder"', () => {
      // Arrange
      domain = 'builder';
      // Act
      scoring['appendDomainBlock'](ScoresOutput, gatewayID, domain);
      // Assert
      expect(ScoresOutput[gatewayID][domain]).toEqual({
        point: 0,
        PDAs: [],
      });
    });

    test('should create a domain block with type "staker"', () => {
      // Arrange
      domain = 'staker';
      // Act
      scoring['appendDomainBlock'](ScoresOutput, gatewayID, domain);
      // Assert
      expect(ScoresOutput[gatewayID][domain]).toEqual({});
    });

    test('Should not append domain block if domain exists in gatewayID', () => {
      // Arrange
      ScoresOutput = {
        gatewayID: {
          citizen: {
            point: 17,
            PDAs: [],
          },
        },
      };
      domain = 'citizen';
      // Act
      scoring['appendDomainBlock'](ScoresOutput, gatewayID, domain);
      // Assert
      expect(ScoresOutput[gatewayID][domain]).toEqual({
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
          staker: {
            validator: {
              point: 0,
              PDAs: [],
            },
          },
        },
      };
    });
    subType = 'validator';
    test('Should be defined', () => {
      // Assert
      expect(scoring['appendStackerSubBlock']).toBeDefined();
    });

    test(`appendStackerSubBlock adds a new sub-block to the staker domain
when subType does not exist`, () => {
      // Arrange
      scoresOutput = {
        gatewayID: {
          staker: {},
        },
      };
      // Act
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);
      // Assert
      expect(scoresOutput[gatewayID].staker[subType]).toEqual({
        point: 0,
        PDAs: [],
      });
    });

    test(`appendStackerSubBlock should not add a new sub-block
     if subType already exists`, () => {
      // Act
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);
      // Assert
      expect(scoresOutput[gatewayID].staker[subType]).toEqual({
        point: 0,
        PDAs: [],
      });
    });

    test("should create a  Sub-block with type 'validator'", () => {
      // Act
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);
      // Assert
      expect(scoresOutput[gatewayID].staker).toEqual({
        validator: { PDAs: [], point: 0 },
      });
    });

    test("should create a  Sub-block with type 'gateway'", () => {
      // Arrange
      scoresOutput = {
        gatewayID: {
          staker: {
            gateway: {
              point: 0,
              PDAs: [],
            },
          },
        },
      };
      subType = 'gateway';
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);
      // Assert
      expect(scoresOutput[gatewayID].staker).toEqual({
        gateway: { PDAs: [], point: 0 },
      });
    });
  });

  describe('calculateCitizensPoint', () => {
    let scoresOutput: PDAScores<ScoringDomainBlock>;
    let gatewayID: string;
    let PDA: IssuedPDA;
    let PDAs: IssuedPDA[];
    let points: number;

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
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      gatewayID = 'gatewayID';
      PDAs = scoresOutput[gatewayID].citizen.PDAs;
      points = scoresOutput[gatewayID].citizen.point;
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
    });

    test('Point should be 0 when there is only 1 PDA', () => {
      // Act
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(PDAs).toContain(PDA);
      expect(PDAs.length).toEqual(1);
      expect(points).toEqual(0);
    });

    test('Point should be 0 when citizen has no "POKT DNA"', () => {
      // Arrange
      PDAs.push(PDA);
      //
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(PDAs).toContain(PDA);
      expect(PDAs.length).toEqual(2);
      expect(points).toEqual(0);
    });

    test('Point should be 0 when citizen has no "POKT DAO"', () => {
      // Arrange
      PDAs.push(PDA);
      // Act
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(PDAs).toContain(PDA);
      expect(PDAs.length).toEqual(2);
      expect(points).toEqual(0);
    });

    test('Point should be 1 when citizen has both "POKT DAO" and "POKT DNA"', () => {
      // Arrange
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
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
      const point: number = scoresOutput[gatewayID].citizen.point;
      // Assert
      expect(PDAs.length).toEqual(4);
      expect(point).toEqual(1);
    });
    test('Should call error from logger when pdaSubtype is wrong', () => {
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
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, fakePDA);
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
            PDAs: [
              {
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
              },
            ],
          },
        },
      };
      gatewayID = 'gatewayID';
    });

    test('Should be defined', () => {
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
      const pointer = scoresOutput[gatewayID].builder;
      // Assert
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
      // Act
      scoring['calculateBuildersPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      const pointer = scoresOutput[gatewayID].builder;
      expect(pointer.point).toEqual(5);
      expect(pointer.PDAs.length).toEqual(2);
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

    test('should not change points if the total is between 1 to 10', () => {
      // Arrange
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 8,
            pdaType: 'builder',
            pdaSubtype: 'DAO Scholar',
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
      scoring['calculateBuildersPoint'](scoresOutput, gatewayID, fakePDA);
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
      // Assert
      const pointer = scoresOutput[gatewayID].staker.validator;
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

    test(`Should call warm method from logger
when PDA_SUB_TYPE is equal to "liquidity provider"`, () => {
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
      // Act
      scoring['calculateStakersPoint'](scoresOutput, gatewayID, PDA);
      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        `Skipped PDA sub type (liquidity provider) for staker`,
        ScoringService.name,
      );
    });
    test('Should call error from logger when pdaSubtype is wrong', () => {
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
      scoring['calculateStakersPoint'](scoresOutput, gatewayID, fakePDA);
      expect(logger.error).toHaveBeenCalledWith(
        `Invalid PDA sub type (fake pdasubtype) for staker`,
        ScoringService.name,
      );
    });
  });

  describe('calculateScores method', () => {
    let PDA: IssuedPDA;
    let returnValue;
    beforeEach(() => {
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
    });

    test('Should be defined', () => {
      // Assert
      expect(scoring.calculateScores).toBeDefined();
    });

    test(`Should call appendGatewayID and add gatewayID to scoresOutput`, () => {
      // Act
      returnValue = scoring.calculateScores([PDA]);
      // Assert
      expect(returnValue['gatewayID']).toBeDefined();
    });

    test("Should return {} if PDA is not 'Valid'", () => {
      // Arrange
      PDA = {
        status: 'Expired',
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

      // Act
      returnValue = scoring.calculateScores([PDA]);
      // Assert
      expect(returnValue).toEqual({});
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
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      // Act
      returnValue = scoring.calculateScores([PDA]);
      // Assert
      const pointer = returnValue['gatewayID'];
      expect(pointer.citizen).toBeDefined();
      expect(pointer.citizen.point).toEqual(0);
      expect(pointer.citizen.PDAs.length).toEqual(1);
      expect(pointer.builder).toBeUndefined();
      expect(pointer.staker).toBeUndefined();
    });

    test(`Should call appendDomainBlock and calculateBuildersPoint
when PDA_TYPE is 'builder', then add PDA to scoresOutput, 
calculate points and append to scoresOutput`, () => {
      // Act
      returnValue = scoring.calculateScores([PDA]);
      // Assert
      const pointer = returnValue['gatewayID'];
      expect(pointer.builder).toBeDefined();
      expect(pointer.builder.point).toEqual(5);
      expect(pointer.builder.PDAs.length).toEqual(1);
      expect(pointer.citizen).toBeUndefined();
      expect(pointer.staker).toBeUndefined();
    });

    test(`Should call appendDomainBlock and calculateStakersPoint
when PDA_TYPE is 'staker', then add PDA to scoresOutput,
calculate points and append to scoresOutput`, () => {
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
      // Act
      returnValue = scoring.calculateScores([PDA]);
      // Assert
      const pointer = returnValue['gatewayID'];
      expect(pointer.staker.gateway).toBeDefined();
      expect(pointer.staker.gateway.point).toEqual(4);
      expect(pointer.staker.gateway.PDAs.length).toEqual(1);
      expect(pointer.citizen).toBeUndefined();
      expect(pointer.builder).toBeUndefined();
    });
    test('Should call error from logger when pdaType is wrong', () => {
      const fakePDA: any = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 4,
            pdaType: 'fake pdaType',
            pdaSubtype: 'Gateway',
            type: 'custodian',
          },
          owner: {
            gatewayId: 'gatewayID',
          },
        },
      };
      scoring.calculateScores([fakePDA]);
      expect(logger.error).toHaveBeenCalledWith(
        `Unknown PDA type (fake pdaType) exists`,
        ScoringService.name,
      );
    });
  });
});
