export const PDAService = jest.fn().mockReturnValue({
  request: jest.fn(),
  getIssuedPDAsGQL: jest.fn(() => {
    return 'mockedValue';
  }),
  getIssuedPDACountGQL: jest.fn(),
  pagination: jest.fn(),
  getIssuedPDAs: jest.fn().mockResolvedValue([]),
});
