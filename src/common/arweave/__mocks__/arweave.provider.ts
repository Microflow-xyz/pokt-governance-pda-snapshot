export const ArweaveProvider = jest.fn().mockReturnValue({
  getPrice: jest.fn(),
  fund: jest.fn(),
  storeData: jest.fn(() => Promise.resolve('mockedTransactionId')),
  upload: jest.fn(() => Promise.resolve({ id: 'mockedTransactionId' })),
});
