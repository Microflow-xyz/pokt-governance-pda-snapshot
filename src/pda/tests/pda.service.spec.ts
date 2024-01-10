import { Test, TestingModule } from "@nestjs/testing";
import { PDAService } from "../pda.service";
import { WinstonProvider } from '@common/winston/winston.provider';
import { HttpModule, HttpService } from '@nestjs/axios'; 
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { AxiosResponse } from 'axios';
import { IssuedPDA } from '../interfaces/pda.interface';
import { of } from 'rxjs';



jest.mock('@common/winston/winston.provider');


describe('PDAService', () => {
  let service: PDAService;
  let axios: HttpService;
  let config: ConfigService;



  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [WinstonProvider, PDAService],
    }).compile();

    service = module.get<PDAService>(PDAService);
    axios = module.get<HttpService>(HttpService);
    config = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  test('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When the request method called', () => {
    const query = 'query';
    let axiosResponse: AxiosResponse;
    let variables: Record<string, any>;
    let returnValue: Record<string, any>;
    

    beforeEach(async () => {
      axiosResponse = {
        data: { issuedPDAs: [{ 'pda': 'pda' }] },
        status: 200,
        statusText: 'OK',
        headers: undefined,
        config: undefined,
      };


      jest.spyOn(config, 'get').mockReturnValue('');
      jest.spyOn(axios, 'post').mockReturnValue(of(axiosResponse));
      jest.spyOn(axios, 'request').mockReturnValue(of(axiosResponse));


      returnValue = await service['request'](query, variables);

    });
    test('Should be defined', () => {
      expect(service['request']).toBeDefined();
    });


    test('Should call post from axios with the correct parameters', () => {
      expect(axios.post).toHaveBeenCalledWith(
        '',
        {
          query: 'query',
          variables: { key: 'value' },
        },
        {
          headers: {
            Authorization: 'Bearer ',
            'x-api-key': '',
            'Content-Type': 'application/json',
          },
        },
      );
    })

    test('Should call get method from config', () => {
      expect(config.get).toHaveBeenCalledWith('MYGATEWAY_ENDPOINT_URL');
    });

    test('Should call get method from config', () => {
      expect(config.get).toHaveBeenCalledWith('MYGATEWAY_AUTHENTICATION_TOKEN');
    });

    test('Should call get method from config', () => {
      expect(config.get).toHaveBeenCalledWith('MYGATEWAY_API_KEY');
    });






    test('Should return the data from the http response', () => {
      expect(returnValue).toEqual(axiosResponse.data);
    });


  })
  describe('When the getIssuedPDAsGQL method called', () => {
    test('Should be defined', () => {
      expect(service['getIssuedPDAsGQL']).toBeDefined()
    });


    test('Should return a valid GraphQL query string', () => {
      expect(service['getIssuedPDAsGQL']()).toContain('query getPDAs');
      expect(service['getIssuedPDAsGQL']()).toContain(`$org_gateway_id: String!`);
      expect(service['getIssuedPDAsGQL']()).toContain(`$take: Float!`);
      expect(service['getIssuedPDAsGQL']()).toContain(`$skip: Float!`);
      expect(service['getIssuedPDAsGQL']()).toContain(`organization: { type: GATEWAY_ID, value: $org_gateway_id }`);
      expect(service['getIssuedPDAsGQL']()).toContain(`take: $take`);
      expect(service['getIssuedPDAsGQL']()).toContain(`skip: $skip`);
      expect(service['getIssuedPDAsGQL']()).toContain(`order: { issuanceDate: "ASC" }`);
    });

  });

  describe('When the getIssuedPDACountGQL method called', () => {
    test('Should be defined', () => {
      expect(service['getIssuedPDACountGQL']).toBeDefined();
    });

    test('getIssuedPDACountGQL should return a valid string', () => {
      expect(service['getIssuedPDACountGQL']()).toEqual(expect.any(String));
      expect(service['getIssuedPDACountGQL']()).toContain('query IssuedPDAsCount');
      expect(service['getIssuedPDACountGQL']()).toContain('$org_gateway_id: String!');
    })
  })

  describe('When the pagination method called', () => {

    test('Should be defined', () => {
      expect(service['pagination']).toBeDefined();
    })

    test('Pagination max > 15', () => {
      const pages = service['pagination'](20);
      expect(service['pagination'](20).length).toBe(2);
      expect(pages[1]).toEqual({ take: 5, skip: 15 });
    });

    test('pagination max < 15', () => {
      const pages = service['pagination'](10)
      expect(pages.length).toBe(1);
      expect(pages[0]).toEqual({ take: 10, skip: 0 });
    });

    test('Pagination max = 15', () => {
      const pages = service['pagination'](15)
      expect(pages.length).toBe(1);
      expect(pages[0]).toEqual({ take: 15, skip: 0 });
    })
  })

  describe('When the getIssuedPDAs method called', () => {
    let issuedPDA: IssuedPDA;
    

    beforeEach( () => {
      issuedPDA = {
        id: '',
        arweaveUrl: '',
        dataAsset: {
          claim: { 'key': 'value' },
          claimArray: [{ 
          type: 'Type1',
          value: 'Value1',
          property: 'Property1'
         }],
          owner: {
            gatewayId: 'string'
          }
        }
      }
    });

    // jest.spyOn(service, 'getIssuedPDAs').mockRejectedValue(of(issuedPDA))

    test('Should be defined', () => {
      expect(service.getIssuedPDAs).toBeDefined();
    });

    // test('Should have been called', () => {
      // expect(service.getIssuedPDAs()).toBe(issuedPDA);
      // expect( service['pagination']).toHaveBeenCalled()
    // })

    // test('Paginiation method Should be called', () => {
      
      
    // })



    // test('Should retrieve issued PDAs', async () => {
    //   expect(await service.getIssuedPDAs()).toEqual([{'pda':'pda'}]);
    // })

    // test('getIssuedPDACountGQL should be called', () => {
    //   expect(service['getIssuedPDACountGQL']).toHaveBeenCalled();
    // });

    // test('getIssuedPDAsGQL should be called', () => {
    //   expect(service['getIssuedPDAsGQL']()).toHaveBeenCalled();
    // })




    // test('Should call request method from getIssuedPDAs', () => {
    // expect(service['request']).toHaveBeenCalledWith(
    //   'simple/price',
    //   'GET',
    //   undefined,
    //   {
    //     ids: 'pocket-network',
    //     vs_currencies: 'usd',
    //   },
    // );
    // });
    //  })


  })
})