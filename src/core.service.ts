import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import moment from 'moment';
import { ArweaveProvider } from '@common/arweave/arweave.provider';
import { PDAService } from './pda/pda.service';

@Injectable()
export class CoreService {
  constructor(
    private readonly pdaService: PDAService,
    private readonly arweaveProvider: ArweaveProvider,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handler() {
    // TODO: There is a need to refactor
    const allPDAs = await this.pdaService.getIssuedPDAs();

    const transaction_id = await this.arweaveProvider.storeData(allPDAs, [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Application-ID', value: 'POKT-NETWORK-PDA-SCORING-SYSTEM' },
      { name: 'Unix-Timestamp', value: String(moment().unix()) },
    ]);

    console.log('The data stored in ', 'https://arweave.net/' + transaction_id);
  }
}
