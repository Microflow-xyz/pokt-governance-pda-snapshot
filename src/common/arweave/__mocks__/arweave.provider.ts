export const ArweaveProvider = jest.fn().mockReturnValue({
  getPrice: jest.fn(),
  fund: jest.fn(),
  storeData: jest.fn().mockResolvedValue('mockedTransactionId'),
  upload: jest.fn().mockResolvedValue({ id: 'mockedTransactionId' }),
});
