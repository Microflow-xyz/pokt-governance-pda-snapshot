export const ArweaveProvider = jest.fn().mockReturnValue({
  storeData: jest.fn(),
  calculateSizeOfData: jest.fn(),
  fundNodeBasedOnSize: jest.fn(),
});
