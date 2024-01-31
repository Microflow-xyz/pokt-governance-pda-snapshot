import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import {
  IssuedPDACountResponse,
  IssuedPDA,
  IssuedPDAsResponse,
} from '../interfaces/pda.interface';
import { PDAService } from '../pda.service';

// Describe the test suite for the PDAService
describe('PDAService', () => {
  let service: PDAService;
  let axios: HttpService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [PDAService],
    }).compile();

    service = module.get<PDAService>(PDAService);
    axios = module.get<HttpService>(HttpService);
    config = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  test('Should be defined', () => {
    // Assert
    expect(service).toBeDefined();
  });

  describe('When the request method called', () => {
    let query: string;
    let axiosResponse: AxiosResponse;
    let variables: Record<string, any>;
    let returnValue: Record<string, any>;

    beforeEach(async () => {
      query = 'query { test { test } }';
      variables = {};
      axiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: undefined,
        config: undefined,
      };
      jest.spyOn(config, 'get').mockReturnValue('');
      jest.spyOn(axios, 'post').mockReturnValue(of(axiosResponse));

      returnValue = await service['request'](query, variables);
    });

    test('Should be defined', () => {
      // Assert
      expect(service['request']).toBeDefined();
    });

    test('Should call get method from config', () => {
      // Assert
      expect(config.get).toHaveBeenCalledWith('MYGATEWAY_ENDPOINT_URL');
      expect(config.get).toHaveBeenCalledWith('MYGATEWAY_AUTHENTICATION_TOKEN');
      expect(config.get).toHaveBeenCalledWith('MYGATEWAY_API_KEY');
    });

    test('Should call post from axios with the correct parameters', () => {
      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        '',
        {
          query,
          variables,
        },
        {
          headers: {
            Authorization: 'Bearer ',
            'x-api-key': '',
            'Content-Type': 'application/json',
          },
        },
      );
    });

    test('Should return body from http response', () => {
      // Assert
      expect(returnValue).toEqual(axiosResponse.data);
    });
  });

  describe('When getIssuedPDAsGQL method called', () => {
    let returnValue: string;

    beforeAll(() => {
      returnValue = service['getIssuedPDAsGQL']();
    });

    test('Should be defined', () => {
      // Assert
      expect(service['getIssuedPDAsGQL']).toBeDefined();
    });

    test('Should return getIssuedPDAs graphQL query', () => {
      // Assert
      expect(returnValue).toBe(
        `
    query getPDAs($org_gateway_id: String!, $take: Float!, $skip: Float!) {
      issuedPDAs(
          filter: { organization: { type: GATEWAY_ID, value: $org_gateway_id } }
          take: $take
          skip: $skip
          order: { issuanceDate: "DESC" }
      ) {
          status
          dataAsset {
              claim
              owner {
                  gatewayId
              }
          }
      }
    }`,
      );
    });
  });

  describe('When getIssuedPDACountGQL method called', () => {
    let returnValue: string;

    beforeEach(() => {
      returnValue = service['getIssuedPDACountGQL']();
    });

    test('Should be defined', () => {
      // Assert
      expect(service['getIssuedPDACountGQL']).toBeDefined();
    });

    test('Should return IssuedPDACount graphQL query', () => {
      // Assert
      expect(returnValue).toBe(
        `
    query IssuedPDAsCount($org_gateway_id: String!) {
        issuedPDAsCount(
            filter: { organization: { type: GATEWAY_ID, value: $org_gateway_id } }
        )
    }`,
      );
    });
  });

  describe('When pagination method called', () => {

    test("Should return pagination when max's value less or equal that 15", () => {
      // Assert
      expect(service['pagination'](14)).toEqual([{ take: 14, skip: 0 }]);
      expect(service['pagination'](15)).toEqual([{ take: 15, skip: 0 }]);
    });

    test("Should return pagination when max's value greater that 15", () => {
      // Assert
      expect(service['pagination'](50)).toEqual([
        { take: 15, skip: 0 },
        { take: 15, skip: 15 },
        { take: 15, skip: 30 },
        { take: 5, skip: 45 },
      ]);
      expect(service['pagination'](60)).toEqual([
        { take: 15, skip: 0 },
        { take: 15, skip: 15 },
        { take: 15, skip: 30 },
        { take: 15, skip: 45 },
      ]);
    });
  });

  describe('When getIssuedPDAs method called', () => {
    let issuedPDA: IssuedPDA;
    let issuedPDACountResponse: IssuedPDACountResponse;
    let PDAResponse: IssuedPDAsResponse;
    let returnValue: Array<IssuedPDA>;

    beforeEach(async () => {
      issuedPDA = {
        status: 'Valid',
        dataAsset: {
          claim: {
            point: 17,
            pdaType: 'citizen',
            pdaSubtype: 'POKT DAO',
          },
          owner: {
            gatewayId: '17',
          },
        },
      };
      issuedPDACountResponse = {
        data: { issuedPDAsCount: 1 },
      };
      PDAResponse = {
        data: {
          issuedPDAs: [issuedPDA],
        },
      };
      jest.spyOn(config, 'get').mockReturnValue('');
      jest
        .spyOn(service as any, 'getIssuedPDAsGQL')
        .mockReturnValue('getIssuedPDAsGQL');
      jest
        .spyOn(service as any, 'getIssuedPDACountGQL')
        .mockReturnValue('getIssuedPDACountGQL');
      jest
        .spyOn(service as any, 'request')
        .mockReturnValueOnce(issuedPDACountResponse);

      jest.spyOn(service as any, 'request').mockReturnValueOnce(PDAResponse);

      returnValue = await service.getIssuedPDAs();
    });

    test('Should be defined', () => {
      // Assert
      expect(service.getIssuedPDAs).toBeDefined();
    });

    test('Should call request method with correct parameters', async () => {
      // Assert
      expect(service['request']).toHaveBeenCalledWith('getIssuedPDACountGQL', {
        org_gateway_id: '',
      });
      expect(service['request']).toHaveBeenCalledWith('getIssuedPDAsGQL', {
        org_gateway_id: '',
        skip: 0,
        take: 1,
      });
      expect(service['request']).toHaveBeenCalledTimes(2);
    });

    test('It should return an empty array when issuedPDAsCount is 0', async () => {
      // Arrange
      issuedPDACountResponse = {
        data: { issuedPDAsCount: 0 },
      };
      PDAResponse = {
        data: {
          issuedPDAs: [],
        },
      };
      jest
        .spyOn(service as any, 'request')
        .mockReturnValueOnce(issuedPDACountResponse);

      jest.spyOn(service as any, 'request').mockReturnValueOnce(PDAResponse);
      // Act
      returnValue = await service.getIssuedPDAs();
      // Assert
      expect(returnValue).toEqual([]);
    });

    test('It should return an array of IssuedPDAs when issuedPDAsCount is not 0', async () => {
      // Assert
      expect(returnValue).toEqual([issuedPDA]);
      expect(service['request']).toHaveBeenCalledTimes(2);
    });
  });
});
