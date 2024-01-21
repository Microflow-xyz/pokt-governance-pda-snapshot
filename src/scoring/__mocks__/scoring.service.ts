export const ScoringService = jest.fn().mockReturnValue({
  calculateScores: jest.fn(() => {
    return {
      gatewayID: {
        citizen: {
          point: 0,
          PDAs: [],
        },
      },
    };
  }),
});
