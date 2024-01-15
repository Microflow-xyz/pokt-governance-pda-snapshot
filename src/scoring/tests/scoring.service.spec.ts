import { Test, TestingModule } from "@nestjs/testing";
import { WinstonProvider } from '@common/winston/winston.provider';
import { ScoringService } from "../scoring.service";
import { ScoringDomainBlock } from "../interfaces/scoring.interface";
import { PDAScores } from "@common/interfaces/common.interface";
import { PDAType, StakerPDASubType } from "src/pda/types/pda.type";
// import { attempt, escape } from "lodash";
// import { exceptions } from "winston";
// import exp from "constants";
import { IssuedPDA } from "src/pda/interfaces/pda.interface";


jest.mock('@common/winston/winston.provider');

describe('ScoringService', () => {
  let scoring: ScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoringService, WinstonProvider],
    }).compile();

    scoring = module.get<ScoringService>(ScoringService);

  });

  test('Should be defined', () => {
    expect(scoring).toBeDefined();
  });

  describe('appendGatewayID', () => {
    let ScoresOutput: PDAScores<ScoringDomainBlock>;
    test('Should append a new gatewayID to scoresOutput', () => {
      ScoresOutput = {};
      let gatewayID = 'gatewayID';
      scoring['appendGatewayID'](ScoresOutput, gatewayID);
      expect(ScoresOutput).toHaveProperty(gatewayID);
      expect(ScoresOutput[gatewayID]).toEqual({});
    });

    test('Should not append an existing gatewayID to scoresOutput', () => {
      ScoresOutput = {
        "gatewayID": {
          "citizen": {
            "point": 0,
            "PDAs": []
          }
        }
      };
      const existingGatewayID = 'gatewayID';
      const scoresOutput = ScoresOutput;
      scoring['appendGatewayID'](scoresOutput, existingGatewayID)

      expect(scoresOutput[existingGatewayID]).toEqual({
        "citizen": {
          point: 0,
          PDAs: []
        }
      });
    });
    test('Append multiple GatewayIDs to scoresOutput', () => {
      ScoresOutput = {};
      const gatewayID1 = 'gatewayID1';
      const gatewayID2 = 'gatewayID2';

      scoring['appendGatewayID'](ScoresOutput, gatewayID1);
      scoring['appendGatewayID'](ScoresOutput, gatewayID2);

      expect(ScoresOutput).toHaveProperty(gatewayID1);
      expect(ScoresOutput).toHaveProperty(gatewayID2);
      expect(ScoresOutput[gatewayID1]).toEqual({});
      expect(ScoresOutput[gatewayID2]).toEqual({});
    });
  });

  describe('appendDomainBlock', () => {
    let ScoresOutput: PDAScores<ScoringDomainBlock>;
    let domain: PDAType;
    let gatewayID: string;

    test("Should be defined", () => {
      expect(scoring['appendDomainBlock']).toBeDefined()
    });

    test('should create a domain block with type "citizen"', () => {
      ScoresOutput = {
        "gatewayID": {}
      };
      domain = 'citizen';
      gatewayID = 'gatewayID'
      scoring['appendDomainBlock'](ScoresOutput, gatewayID, domain)

      expect(ScoresOutput[gatewayID][domain]).toEqual({
        point: 0,
        PDAs: [],
      });
    });

    test('Should create a domain block with type "builder"', () => {
      ScoresOutput = {
        "gatewayID": {}
      };
      domain = 'builder';
      gatewayID = 'gatewayID'
      scoring['appendDomainBlock'](ScoresOutput, gatewayID, domain)

      expect(ScoresOutput[gatewayID][domain]).toEqual({
        point: 0,
        PDAs: [],
      });
    });

    test('should create a domain block with type "staker"', () => {
      ScoresOutput = {
        "gatewayID": {}
      };
      domain = 'staker';
      gatewayID = 'gatewayID';
      scoring['appendDomainBlock'](ScoresOutput, gatewayID, domain)

      expect(ScoresOutput[gatewayID][domain]).toEqual({})
    })



    test('Should not append domain block if domain exists in gatewayID', () => {
      ScoresOutput = {
        "gatewayID": {
          "citizen": {
            point: 17,
            PDAs: []
          }
        }
      };
      gatewayID = 'gatewayID';
      domain = 'citizen';
      scoring['appendDomainBlock'](ScoresOutput, gatewayID, domain)

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

    test("Should be defined", () => {
      expect(scoring['appendStackerSubBlock']).toBeDefined()
    })

    test('appendStackerSubBlock adds a new sub-block to the staker domain when subType does not exist', () => {
      gatewayID = 'gatewayID';
      scoresOutput = {
        "gatewayID": {
          'staker': {}
        }
      };
      subType = "validator"
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);

      expect(scoresOutput[gatewayID].staker[subType]).toEqual({
        point: 0,
        PDAs: [],
      });
    });

    test('appendStackerSubBlock should not add a new sub-block if subType already exists', () => {
      scoresOutput = {
        'gatewayID': {
          staker: {
            validator: {
              point: 17,
              PDAs: [],
            },
          },
        },
      };
      gatewayID = 'gatewayID';
      subType = 'validator';
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);

      expect(scoresOutput[gatewayID].staker[subType]).toEqual({
        point: 17,
        PDAs: [],
      });
    });

    test("should create a  Sub-block with type 'validator'", () => {
      scoresOutput = {
        'gatewayID': {
          staker: {
            validator: {
              point: 0,
              PDAs: [],
            },
          },
        },
      };
      gatewayID = 'gatewayID';
      subType = 'validator';
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);
      expect(scoresOutput[gatewayID].staker).toEqual({ "validator": { "PDAs": [], "point": 0 } })
    });

    // test("should create a  Sub-block with type 'liquidity provider'", () => {
    // //   scoresOutput = {
    //     'gatewayID': {
    //       staker: {
    //         'liquidity provider': {
    //           point: 0,
    //           PDAs: [],
    //         },
    //       },
    //     },
    //   };
    //   gatewayID = 'gatewayID';
    //   subType = 'liquidity provider';
    //   scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);
    //   expect(scoresOutput[gatewayID].staker).toEqual({"liquidity provider": {"PDAs": [], "point": 0}})
    // });

    test("should create a  Sub-block with type 'gateway'", () => {
      scoresOutput = {
        'gatewayID': {
          staker: {
            gateway: {
              point: 0,
              PDAs: [],
            },
          },
        },
      };
      gatewayID = 'gatewayID';
      subType = 'gateway';
      scoring['appendStackerSubBlock'](scoresOutput, gatewayID, subType);
      expect(scoresOutput[gatewayID].staker).toEqual({ "gateway": { "PDAs": [], "point": 0 } })
    });
  });

  describe("calculateCitizensPoint", () => {
    let scoresOutput: PDAScores<ScoringDomainBlock>;
    let gatewayID: string;
    let PDA: IssuedPDA;
    let PDAs: IssuedPDA[];
    let points: number;

    beforeEach(() => {
      scoresOutput = {
        "gatewayID": {
          "citizen": {
            "point": 0,
            "PDAs": []
          }
        }
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
            gatewayId: 'gatewayID'
          }
        }
      };
      gatewayID = "gatewayID";
      PDAs = scoresOutput[gatewayID].citizen.PDAs;
      points = scoresOutput[gatewayID].citizen.point;
    })

    test("Should be defined", () => {
      expect(scoring['calculateCitizensPoint']).toBeDefined()
    });

    test('Should store related PDA', () => {
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      expect(scoresOutput[gatewayID].citizen.PDAs).toContain(PDA);
    });

    test('Point should be 0 when there is only 1 PDA', () => {

      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      expect(PDAs).toContain(PDA);
      expect(PDAs.length).toEqual(1);
      expect(points).toEqual(0);
    });

    test('Point should be 0 when citizen has no "POKT DNA"', () => {
      PDAs.push(PDA);
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      expect(PDAs).toContain(PDA);
      expect(PDAs.length).toEqual(2);
      expect(points).toEqual(0);
    });

    test('Point should be 0 when citizen has no "POKT DAO"', () => {

      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'citizen',
            pdaSubtype: 'POKT DNA',
          },
          owner: {
            gatewayId: 'gatewayID'
          }
        }
      };
      PDAs.push(PDA);
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);

      expect(PDAs).toContain(PDA);
      expect(PDAs.length).toEqual(2);
      expect(points).toEqual(0);
    });

    test('Point should be 1 when citizen has both "POKT DAO" and "POKT DNA"', () => {
      PDAs.push(PDA);
      PDAs.push(PDA);
      PDAs.push(PDA);
      PDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'citizen',
            pdaSubtype: 'POKT DNA',
          },
          owner: {
            gatewayId: 'gatewayID'
          }
        }
      };
      scoring['calculateCitizensPoint'](scoresOutput, gatewayID, PDA);
      let point: number = scoresOutput[gatewayID].citizen.point;
      expect(PDAs.length).toEqual(4);
      expect(point).toEqual(1);
    })
  });
});