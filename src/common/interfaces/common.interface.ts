export interface StakerDomainBlock<Block> {
  validator?: Block;
  gateway?: Block;
  'liquidity provider'?: Block;
}

export interface PDAScores<Block> {
  [prop: string]: {
    citizen?: Block;
    builder?: Block;
    staker?: StakerDomainBlock<Block>;
  };
}
