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

  test('should be defined', () => {
    // Assert
    expect(module).toBeDefined();
  });

  test('should provide ScoringService', () => {
    // Assert
    expect(scoringService).toBeDefined();
  });

  test('should return a score from ScoringService', () => {
    // Arrange
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
    // Assert
    expect(score).toEqual(scoresOutput);
  });
});
