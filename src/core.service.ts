import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WinstonProvider } from '@common/winston/winston.provider';
import { PDAService } from './pda/pda.service';
import { ScoringService } from './scoring/scoring.service';
import { StoreService } from './store/store.service';

@Injectable()
export class CoreService {
  constructor(
    private readonly pdaService: PDAService,
    private readonly scoringService: ScoringService,
    private readonly storeService: StoreService,
    private readonly logger: WinstonProvider,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handler() {
    this.logger.log('The job executed', CoreService.name);
    // Get all issued PDAs
    const allPDAs = await this.pdaService.getIssuedPDAs();

    this.logger.debug(
      'All issued PDAs:\n' + JSON.stringify(allPDAs),
      CoreService.name,
    );
    // calculate scores
    const scores = this.scoringService.calculateScores(allPDAs);

    this.logger.debug(
      "All issued PDAs' scores:\n" + JSON.stringify(scores),
      CoreService.name,
    );
    // Store Scores & PDAs
    const arweaveURL = await this.storeService.storeScores(scores);

    this.logger.log(
      `The job finished. storage URL is (${arweaveURL})`,
      CoreService.name,
    );
  }
}
