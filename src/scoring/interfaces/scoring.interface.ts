import { IssuedPDA } from '../../pda/interfaces/pda.interface';

export interface DomainBlock {
  point: number;
  PDAs: Array<IssuedPDA>;
}

export interface StakerDomainBlock {
  validator?: DomainBlock;
  gateway?: DomainBlock;
}

export interface PDAScoresOutput {
  [prop: string]: {
    citizen?: DomainBlock;
    builder?: DomainBlock;
    staker?: StakerDomainBlock;
  };
}
