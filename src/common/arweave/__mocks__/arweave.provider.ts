export const ArweaveProvider = jest.fn().mockReturnValue({
  storeData: jest.fn().mockResolvedValue('mockedTransactionId'),
  calculateSizeOfData: jest.fn(),
  fundNodeBasedOnSize: jest.fn(),
});
