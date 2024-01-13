import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { ArweaveProvider } from '@common/arweave/arweave.provider';
import { ArweaveTag } from '@common/arweave/interfaces/arweave.interface';
import { PDAScores } from '@common/interfaces/common.interface';
import { ScoringDomainBlock } from '../scoring/interfaces/scoring.interface';
import { StoreDomainBlock } from './interfaces/store.interface';

@Injectable()
export class StoreService {
  constructor(
    private readonly configService: ConfigService,
    private readonly arweaveProvider: ArweaveProvider,
  ) {}

  private async storePDAsBlock(scores: PDAScores<ScoringDomainBlock>) {
    const arweaveBaseURL = this.configService.get<string>('ARWEAVE_BASE_URL');
    const tags: Array<ArweaveTag> = [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Application-ID', value: 'POKT-NETWORK-PDA-SCORING-SYSTEM' },
      { name: 'Data-ID', value: 'PDAs' },
    ];

    for (const gatewayID in scores) {
      if (Object.prototype.hasOwnProperty.call(scores, gatewayID)) {
        const gatewayBlock = scores[gatewayID];

        const citizenPDAs = gatewayBlock.citizen?.PDAs;
        const builderPDAs = gatewayBlock.builder?.PDAs;
        const validatorStakerPDAs = gatewayBlock.staker?.validator?.PDAs;
        const gatewayStakerPDAs = gatewayBlock.staker?.gateway?.PDAs;

        const transactionIDs = await Promise.all([
          citizenPDAs?.length > 0
            ? this.arweaveProvider.storeData(citizenPDAs, tags)
            : '',
          builderPDAs?.length > 0
            ? this.arweaveProvider.storeData(builderPDAs, tags)
            : '',
          validatorStakerPDAs?.length > 0
            ? this.arweaveProvider.storeData(validatorStakerPDAs, tags)
            : '',
          gatewayStakerPDAs?.length > 0
            ? this.arweaveProvider.storeData(gatewayStakerPDAs, tags)
            : '',
        ]);

        scores as unknown as PDAScores<StoreDomainBlock>;

        if (citizenPDAs?.length > 0) {
          (gatewayBlock.citizen.PDAs as unknown as string) =
            arweaveBaseURL + transactionIDs[0];
        }
        if (builderPDAs?.length > 0) {
          (gatewayBlock.builder.PDAs as unknown as string) =
            arweaveBaseURL + transactionIDs[1];
        }
        if (validatorStakerPDAs?.length > 0) {
          (gatewayBlock.staker.validator.PDAs as unknown as string) =
            arweaveBaseURL + transactionIDs[2];
        }
        if (gatewayStakerPDAs?.length > 0) {
          (gatewayBlock.staker.gateway.PDAs as unknown as string) =
            arweaveBaseURL + transactionIDs[3];
        }
      }
    }
  }

  async storeScores(scores: PDAScores<ScoringDomainBlock>) {
    const arweaveBaseURL = this.configService.get<string>('ARWEAVE_BASE_URL');
    const startTimeOfYesterday = moment().utc().add(-1, 'day').startOf('day');
    const tags: Array<ArweaveTag> = [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Application-ID', value: 'POKT-NETWORK-PDA-SCORING-SYSTEM' },
      { name: 'Data-ID', value: 'PDAs-SCORES' },
      { name: 'Unix-Timestamp', value: String(startTimeOfYesterday.unix()) },
    ];

    await this.storePDAsBlock(scores);

    const transaction_id = await this.arweaveProvider.storeData(
      scores as unknown as PDAScores<StoreDomainBlock>,
      tags,
    );

    return arweaveBaseURL + transaction_id;
  }
}
