import { IssuedPDA } from '../../pda/interfaces/pda.interface';

export interface ScoringDomainBlock {
  point: number;
  PDAs: Array<IssuedPDA>;
}
