import { Injectable } from '@nestjs/common';
import lodash from 'lodash';
import { PDAScores } from '@common/interfaces/common.interface';
import { WinstonProvider } from '@common/winston/winston.provider';
import { IssuedPDA } from '../pda/interfaces/pda.interface';
import { ScoringDomainBlock } from './interfaces/scoring.interface';
import { ScoringStakerSubType } from './types/scoring.type';
import {
  BuilderPDASubType,
  PDAType,
  StakerPDASubType,
} from 'src/pda/types/pda.type';

@Injectable()
export class ScoringService {
  constructor(private readonly logger: WinstonProvider) {}

  private appendGatewayID(
    scoresOutput: PDAScores<ScoringDomainBlock>,
    gatewayID: string,
  ) {
    if (!(gatewayID in scoresOutput)) {
      scoresOutput[gatewayID] = {};
    }
  }

  private appendDomainBlock(
    scoresOutput: PDAScores<ScoringDomainBlock>,
    gatewayID: string,
    domain: PDAType,
  ) {
    if (!(domain in scoresOutput[gatewayID])) {
      if (domain !== 'staker') {
        scoresOutput[gatewayID][domain] = {
          point: 0,
          PDAs: [],
        };
      } else {
        scoresOutput[gatewayID][domain] = {};
      }
    }
  }

  private appendStackerSubBlock(
    scoresOutput: PDAScores<ScoringDomainBlock>,
    gatewayID: string,
    subType: Lowercase<StakerPDASubType>,
  ) {
    if (!(subType in scoresOutput[gatewayID].staker)) {
      scoresOutput[gatewayID].staker[subType] = {
        point: 0,
        PDAs: [],
      };
    }
  }

  private calculateCitizensPoint(
    scoresOutput: PDAScores<ScoringDomainBlock>,
    gatewayID: string,
    PDA: IssuedPDA,
  ) {
    const pointer = scoresOutput[gatewayID].citizen;

    // Store related PDA
    pointer.PDAs.push(PDA);

    if (pointer.point === 0) {
      let hasDAOBadge: boolean = false,
        hasDNABadge: boolean = false;

      // check exists of badges
      for (let index = 0; index < pointer.PDAs.length; index++) {
        const PDASubType = pointer.PDAs[index].dataAsset.claim.pdaSubtype;

        if (PDASubType === 'POKT DAO') {
          hasDAOBadge = true;
        } else if (PDASubType === 'POKT DNA') {
          hasDNABadge = true;
        } else {
          this.logger.error(
            `Invalid PDA sub type (${PDASubType}) for citizen`,
            ScoringService.name,
          );
        }
      }

      // assign point when all badges achieved
      if (hasDAOBadge && hasDNABadge) {
        pointer.point = 1;
      }
    }
  }

  private calculateBuildersPoint(
    scoresOutput: PDAScores<ScoringDomainBlock>,
    gatewayID: string,
    PDA: IssuedPDA,
  ) {
    const pointer = scoresOutput[gatewayID].builder;

    // Store related PDA
    pointer.PDAs.push(PDA);

    if (pointer.point < 10) {
      const PDASubTypeToPointMapper: Record<string, number> = {};
      const BUILDER_PDA_SUB_TYPES: Array<BuilderPDASubType> = [
        'Protocol Builder',
        'Priority Builder',
        'Socket Builder',
        'Proposal Builder',
        'Bounty Hunter',
        'Thought Leader',
        'DAO Scholar',
        'OG Governor',
      ];

      // Calculate the point of current state
      for (let index = 0; index < pointer.PDAs.length; index++) {
        const PDASubType = pointer.PDAs[index].dataAsset.claim
          .pdaSubtype as BuilderPDASubType;
        const PDAPoint = pointer.PDAs[index].dataAsset.claim.point;

        if (BUILDER_PDA_SUB_TYPES.includes(PDASubType)) {
          if (PDASubType in PDASubTypeToPointMapper) {
            if (PDAPoint > PDASubTypeToPointMapper[PDASubType]) {
              PDASubTypeToPointMapper[PDASubType] = PDAPoint;
            }
          } else {
            PDASubTypeToPointMapper[PDASubType] = PDAPoint;
          }
        } else {
          this.logger.error(
            `Invalid PDA sub type (${PDASubType}) for builder`,
            ScoringService.name,
          );
        }
      }

      // Check sum of points and threshold
      const sumOfPoints = lodash.sum(Object.values(PDASubTypeToPointMapper));
      if (sumOfPoints >= 10) {
        pointer.point = 10;
      } else {
        pointer.point = sumOfPoints;
      }
    }
  }

  private calculateStakersPoint(
    scoresOutput: PDAScores<ScoringDomainBlock>,
    gatewayID: string,
    PDA: IssuedPDA,
  ) {
    const PDA_SUB_TYPE =
      PDA.dataAsset.claim.pdaSubtype.toLowerCase() as ScoringStakerSubType;

    this.appendStackerSubBlock(scoresOutput, gatewayID, PDA_SUB_TYPE);

    const pointer = scoresOutput[gatewayID].staker[
      PDA_SUB_TYPE
    ] as ScoringDomainBlock;
    // Store related PDA
    pointer.PDAs.push(PDA);

    // Sum of points
    const sumOfPoints = lodash.sumBy(
      pointer.PDAs,
      (item) => item.dataAsset.claim.point,
    );

    if (PDA_SUB_TYPE === 'validator') {
      pointer.point = Math.sqrt(sumOfPoints);
    } else if (PDA_SUB_TYPE === 'gateway') {
      pointer.point = sumOfPoints;
    } else if (PDA_SUB_TYPE === 'liquidity provider') {
      this.logger.warn(
        `Skipped PDA sub type (${PDA_SUB_TYPE}) for staker`,
        ScoringService.name,
      );
    } else {
      this.logger.error(
        `Invalid PDA sub type (${PDA_SUB_TYPE}) for staker`,
        ScoringService.name,
      );
    }
  }

  calculateScores(PDAs: Array<IssuedPDA>): PDAScores<ScoringDomainBlock> {
    const scoresOutput: PDAScores<ScoringDomainBlock> = {};

    for (let index = 0; index < PDAs.length; index++) {
      const PDA = PDAs[index];

      if (PDA.status === 'Valid') {
        const GATEWAY_ID = PDA.dataAsset.owner.gatewayId;
        const PDA_TYPE = PDA.dataAsset.claim.pdaType;

        // Create empty object for new gatewayID
        this.appendGatewayID(scoresOutput, GATEWAY_ID);

        if (PDA_TYPE === 'citizen') {
          // Create empty object with initial values for citizen domain
          this.appendDomainBlock(scoresOutput, GATEWAY_ID, PDA_TYPE);
          // calculate point and append PDAs
          this.calculateCitizensPoint(scoresOutput, GATEWAY_ID, PDA);
        } else if (PDA_TYPE === 'builder') {
          // Create empty object with initial values for builder domain
          this.appendDomainBlock(scoresOutput, GATEWAY_ID, PDA_TYPE);
          // Calculate point and append PDAs
          this.calculateBuildersPoint(scoresOutput, GATEWAY_ID, PDA);
        } else if (PDA_TYPE === 'staker') {
          // Create empty object with initial values for staker domain
          this.appendDomainBlock(scoresOutput, GATEWAY_ID, PDA_TYPE);
          // Calculate point and append PDAs
          this.calculateStakersPoint(scoresOutput, GATEWAY_ID, PDA);
        } else {
          this.logger.error(
            `Unknown PDA type (${PDA_TYPE}) exists`,
            ScoringService.name,
          );
        }
      }
    }

    return scoresOutput;
  }
}
