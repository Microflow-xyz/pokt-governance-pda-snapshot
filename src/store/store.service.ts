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

    for (const ETHWalletAddr in scores) {
      if (Object.prototype.hasOwnProperty.call(scores, ETHWalletAddr)) {
        const voterBlock = scores[ETHWalletAddr];

        const citizenPDAs = voterBlock.citizen?.PDAs;
        const builderPDAs = voterBlock.builder?.PDAs;
        const validatorStakerPDAs = voterBlock.staker?.validator?.PDAs;
        const gatewayStakerPDAs = voterBlock.staker?.gateway?.PDAs;
        const liquidityProviderPDAs =
          voterBlock.staker?.['liquidity provider']?.PDAs;

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
          liquidityProviderPDAs?.length > 0
            ? this.arweaveProvider.storeData(liquidityProviderPDAs, tags)
            : '',
        ]);

        scores as unknown as PDAScores<StoreDomainBlock>;

        if (citizenPDAs?.length > 0) {
          (voterBlock.citizen.PDAs as unknown as string) = new URL(
            transactionIDs[0],
            arweaveBaseURL,
          ).href;
        }
        if (builderPDAs?.length > 0) {
          (voterBlock.builder.PDAs as unknown as string) = new URL(
            transactionIDs[1],
            arweaveBaseURL,
          ).href;
        }
        if (validatorStakerPDAs?.length > 0) {
          (voterBlock.staker.validator.PDAs as unknown as string) = new URL(
            transactionIDs[2],
            arweaveBaseURL,
          ).href;
        }
        if (gatewayStakerPDAs?.length > 0) {
          (voterBlock.staker.gateway.PDAs as unknown as string) = new URL(
            transactionIDs[3],
            arweaveBaseURL,
          ).href;
        }
        if (liquidityProviderPDAs?.length > 0) {
          (voterBlock.staker['liquidity provider'].PDAs as unknown as string) =
            new URL(transactionIDs[4], arweaveBaseURL).href;
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

    return new URL(transaction_id, arweaveBaseURL).href;
  }
}
