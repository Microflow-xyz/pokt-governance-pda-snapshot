export const PDAService = jest.fn().mockReturnValue({
  getIssuedPDAs: jest.fn().mockResolvedValue([]),
  getIssuedPDAsGQL: jest.fn(() => {
    return 'mockedValue';
  }),
});
