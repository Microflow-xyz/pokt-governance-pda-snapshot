import { Injectable } from '@nestjs/common';
import lodash from 'lodash';
import { PDAScores } from '@common/interfaces/common.interface';
import { WinstonProvider } from '@common/winston/winston.provider';
import { IssuedPDA } from '../pda/interfaces/pda.interface';
import {
  BuilderPDASubType,
  PDAType,
  StakerPDASubType,
} from '../pda/types/pda.type';
import { ScoringDomainBlock } from './interfaces/scoring.interface';
import { ScoringStakerSubType } from './types/scoring.type';

@Injectable()
export class ScoringService {
  constructor(private readonly logger: WinstonProvider) {}

  private appendETHVotingAddr(
    scoresOutput: PDAScores<ScoringDomainBlock>,
    ETHVotingAddr: string,
  ) {
    if (!(ETHVotingAddr in scoresOutput)) {
      scoresOutput[ETHVotingAddr] = {};
    }
  }

  private appendDomainBlock(
    scoresOutput: PDAScores<ScoringDomainBlock>,
    ETHVotingAddr: string,
    domain: PDAType,
  ) {
    if (!(domain in scoresOutput[ETHVotingAddr])) {
      if (domain !== 'staker') {
        scoresOutput[ETHVotingAddr][domain] = {
          point: 0,
          PDAs: [],
        };
      } else {
        scoresOutput[ETHVotingAddr][domain] = {};
      }
    }
  }

  private appendStackerSubBlock(
    scoresOutput: PDAScores<ScoringDomainBlock>,
    ETHVotingAddr: string,
    subType: Lowercase<StakerPDASubType>,
  ) {
    if (!(subType in scoresOutput[ETHVotingAddr].staker)) {
      scoresOutput[ETHVotingAddr].staker[subType] = {
        point: 0,
        PDAs: [],
      };
    }
  }

  private calculateCitizensPoint(
    scoresOutput: PDAScores<ScoringDomainBlock>,
    ETHVotingAddr: string,
    PDA: IssuedPDA,
  ) {
    const pointer = scoresOutput[ETHVotingAddr].citizen;

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
    ETHVotingAddr: string,
    PDA: IssuedPDA,
  ) {
    const pointer = scoresOutput[ETHVotingAddr].builder;

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
    ETHVotingAddr: string,
    PDA: IssuedPDA,
  ) {
    const PDA_SUB_TYPE =
      PDA.dataAsset.claim.pdaSubtype.toLowerCase() as ScoringStakerSubType;

    this.appendStackerSubBlock(scoresOutput, ETHVotingAddr, PDA_SUB_TYPE);

    const pointer = scoresOutput[ETHVotingAddr].staker[
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
      pointer.point = sumOfPoints;
    } else {
      this.logger.error(
        `Invalid PDA sub type (${PDA_SUB_TYPE}) for staker`,
        ScoringService.name,
      );
    }
  }

  calculateScores(PDAs: Array<IssuedPDA>): PDAScores<ScoringDomainBlock> {
    const scoresOutput: PDAScores<ScoringDomainBlock> = {};
    const GIDToEthVotingAddr: Record<string, string> = {};
    const canBeScoredPDAs: Array<IssuedPDA> = [];

    // find voting address and PDAs that can be scored
    for (let index = 0; index < PDAs.length; index++) {
      const PDA = PDAs[index];

      const GATEWAY_ID = PDA.dataAsset.owner.gatewayId;
      const PDA_TYPE = PDA.dataAsset.claim.pdaType;

      if (
        PDA_TYPE === 'citizen' &&
        PDA.dataAsset.claim.pdaSubtype === 'POKT DAO'
      ) {
        GIDToEthVotingAddr[GATEWAY_ID] = PDA.dataAsset.claim.votingAddress;
      }

      if (GATEWAY_ID in GIDToEthVotingAddr) {
        canBeScoredPDAs.push(PDA);
      }
    }

    // calculate scores of PDAs that can be scored
    for (let index = 0; index < canBeScoredPDAs.length; index++) {
      const PDA = canBeScoredPDAs[index];

      const GATEWAY_ID = PDA.dataAsset.owner.gatewayId;
      const PDA_TYPE = PDA.dataAsset.claim.pdaType;
      const ETH_VOTING_ADDR = GIDToEthVotingAddr[GATEWAY_ID];

      // Create empty object for new gatewayID
      this.appendETHVotingAddr(scoresOutput, ETH_VOTING_ADDR);

      if (PDA_TYPE === 'citizen') {
        // Create empty object with initial values for citizen domain
        this.appendDomainBlock(scoresOutput, ETH_VOTING_ADDR, PDA_TYPE);
        // calculate point and append PDAs
        this.calculateCitizensPoint(scoresOutput, ETH_VOTING_ADDR, PDA);
      } else if (PDA_TYPE === 'builder') {
        // Create empty object with initial values for builder domain
        this.appendDomainBlock(scoresOutput, ETH_VOTING_ADDR, PDA_TYPE);
        // Calculate point and append PDAs
        this.calculateBuildersPoint(scoresOutput, ETH_VOTING_ADDR, PDA);
      } else if (PDA_TYPE === 'staker') {
        // Create empty object with initial values for staker domain
        this.appendDomainBlock(scoresOutput, ETH_VOTING_ADDR, PDA_TYPE);
        // Calculate point and append PDAs
        this.calculateStakersPoint(scoresOutput, ETH_VOTING_ADDR, PDA);
      } else {
        this.logger.error(
          `Unknown PDA type (${PDA_TYPE}) exists`,
          ScoringService.name,
        );
      }
    }

    return scoresOutput;
  }
}
