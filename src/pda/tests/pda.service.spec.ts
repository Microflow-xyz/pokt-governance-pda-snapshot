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

  // Setup before each test
  beforeEach(async () => {
    // Create a testing module
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [PDAService],
    }).compile();

    // Initialize instances for testing
    service = module.get<PDAService>(PDAService);
    axios = module.get<HttpService>(HttpService);
    config = module.get<ConfigService>(ConfigService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Basic test to check if the service is defined
  test('Should be defined', () => {
    expect(service).toBeDefined();
  });

  // Describe the 'request' method tests
  describe('When the request method called', () => {
    let query: string;
    let axiosResponse: AxiosResponse;
    let variables: Record<string, any>;
    let returnValue: Record<string, any>;

    // Setup before each test
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

    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(service['request']).toBeDefined();
    });

    // Test to check if the method calls get method from config for endpoint URL, authentication token, and API key
    test('Should call get method from config', () => {
      expect(config.get).toHaveBeenCalledWith('MYGATEWAY_ENDPOINT_URL');
      expect(config.get).toHaveBeenCalledWith('MYGATEWAY_AUTHENTICATION_TOKEN');
      expect(config.get).toHaveBeenCalledWith('MYGATEWAY_API_KEY');
    });

    // Test to check if the method calls post from axios with the correct parameters
    test('Should call post from axios with the correct parameters', () => {
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

    // Test to check if the method returns body from http response
    test('Should return body from http response', () => {
      expect(returnValue).toEqual(axiosResponse.data);
    });
  });

  // Describe the 'getIssuedPDAsGQL' method tests
  describe('When getIssuedPDAsGQL method called', () => {
    let returnValue: string;

    // Setup before each test
    beforeAll(() => {
      returnValue = service['getIssuedPDAsGQL']();
    });

    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(service['getIssuedPDAsGQL']).toBeDefined();
    });

    // Test to check if the method returns getIssuedPDAs graphQL query
    test('Should return getIssuedPDAs graphQL query', () => {
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

  // Describe the 'getIssuedPDACountGQL' method tests
  describe('When getIssuedPDACountGQL method called', () => {
    let returnValue: string;

    // Setup before each test
    beforeEach(() => {
      returnValue = service['getIssuedPDACountGQL']();
    });

    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(service['getIssuedPDACountGQL']).toBeDefined();
    });

    // Test to check if the method returns IssuedPDACount graphQL query
    test('Should return IssuedPDACount graphQL query', () => {
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

  // Describe the 'pagination' method tests
  describe('When pagination method called', () => {
    // Test to check if the method returns pagination when max's value is less or equal to 15
    test("Should return pagination when max's value less or equal that 15", () => {
      expect(service['pagination'](14)).toEqual([{ take: 14, skip: 0 }]);
      expect(service['pagination'](15)).toEqual([{ take: 15, skip: 0 }]);
    });

    // Test to check if the method returns pagination when max's value is greater than 15
    test("Should return pagination when max's value greater that 15", () => {
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

  // Describe the 'getIssuedPDAs' method tests
  describe('When getIssuedPDAs method called', () => {
    let issuedPDA: IssuedPDA;
    let issuedPDACountResponse: IssuedPDACountResponse;
    let PDAResponse: IssuedPDAsResponse;
    let returnValue: Array<IssuedPDA>;

    // Setup before each test
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

    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(service.getIssuedPDAs).toBeDefined();
    });

    // Test to check if the method calls request method with correct parameters
    test('Should call request method with correct parameters', async () => {
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

    // Test to check if the method returns an empty array when issuedPDAsCount is 0
    test('It should return an empty array when issuedPDAsCount is 0', async () => {
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
      returnValue = await service.getIssuedPDAs();
      expect(returnValue).toEqual([]);
    });

    // Test to check if the method returns an array of IssuedPDAs when issuedPDAsCount is not 0
    test('It should return an array of IssuedPDAs when issuedPDAsCount is not 0', async () => {
      expect(returnValue).toEqual([issuedPDA]);
      expect(service['request']).toHaveBeenCalledTimes(2);
    });
  });
});
