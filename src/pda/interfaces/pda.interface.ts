export interface IssuedPDA {
  id: string;
  arweaveUrl: string;
  dataAsset: {
    claim: Record<string, string>;
    claimArray: Array<{
      type: string;
      value: string;
      property: string;
    }>;
    owner: {
      gatewayId: string;
    };
  };
}

export interface IssuedPDAsResponse {
  data: {
    issuedPDAs: Array<IssuedPDA>;
  };
}

export interface IssuedPDAsVariables {
  org_gateway_id: string;
  take: number;
  skip: number;
}

export interface IssuedPDACountResponse {
  data: {
    issuedPDAsCount: number;
  };
}

export interface IssuedPDACountVariables {
  org_gateway_id: string;
}
