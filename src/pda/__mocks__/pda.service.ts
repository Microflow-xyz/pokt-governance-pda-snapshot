export const PDAService = jest.fn().mockReturnValue({
  getIssuedPDAs: jest.fn(),
  getIssuedPDAsGQL: jest.fn(() => {
    return 'mockedValue';
  }),
});
