import { Test, TestingModule } from '@nestjs/testing';
import { IssuedPDA } from 'src/pda/interfaces/pda.interface';
import { ScoringModule } from '../scoring.module';
import { ScoringService } from '../scoring.service';

jest.mock('../scoring.service');

describe('ScoringModule', () => {
  let module: TestingModule;
  let scoringService: ScoringService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ScoringModule],
    }).compile();

    scoringService = module.get<ScoringService>(ScoringService);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide ScoringService', () => {
    expect(scoringService).toBeDefined();
  });

  it('should return a score from ScoringService', () => {
    const scoresOutput = {
      gatewayID: {
        citizen: {
          point: 0,
          PDAs: [],
        },
      },
    };
    const PDA: IssuedPDA = {
      status: 'Valid',
      dataAsset: {
        claim: {
          point: 10,
          pdaType: 'citizen',
          pdaSubtype: 'POKT DAO',
        },
        owner: {
          gatewayId: 'gatewayID',
        },
      },
    };
    const score = scoringService.calculateScores([PDA]);
    expect(score).toEqual(scoresOutput);
  });
});
