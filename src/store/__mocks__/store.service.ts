export const StoreService = jest.fn().mockReturnValue({
  storePDAsBlock: jest.fn(),
  storeScores: jest.fn().mockReturnValue('arweaveBaseURL'),
});
