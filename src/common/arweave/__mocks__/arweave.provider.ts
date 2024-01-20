export const ArweaveProvider = jest.fn().mockReturnValue({
  getPrice: jest.fn(),
  fund: jest.fn(),
  upload: jest.fn(() => Promise.resolve({ id: 'mockedTransactionId' })),
});
