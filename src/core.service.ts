import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArweaveProvider } from '@common/arweave/arweave.provider';
import { PDAService } from './pda/pda.service';
import { ScoringService } from './scoring/scoring.service';

@Injectable()
export class CoreService {
  constructor(
    private readonly pdaService: PDAService,
    private readonly scoringService: ScoringService,
    private readonly arweaveProvider: ArweaveProvider,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handler() {
    // Get all issued PDAs
    const allPDAs = await this.pdaService.getIssuedPDAs();
    // calculate scores
    const scores = this.scoringService.calculateScores(allPDAs);

    // const transaction_id = await this.arweaveProvider.storeData(allPDAs, [
    //   { name: 'Content-Type', value: 'application/json' },
    //   { name: 'Application-ID', value: 'POKT-NETWORK-PDA-SCORING-SYSTEM' },
    //   { name: 'Unix-Timestamp', value: String(moment().unix()) },
    // ]);

    console.log('scores:', scores);
  }
}
