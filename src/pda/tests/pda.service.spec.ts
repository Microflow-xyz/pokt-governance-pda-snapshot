import { Test, TestingModule } from "@nestjs/testing";
import { PDAService } from "../pda.service";
import { WinstonProvider } from '@common/winston/winston.provider';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
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
            expect(service['request']).toBeDefined();
        });


        test('Should call get method from config', () => {
            expect(config.get).toHaveBeenCalledWith('MYGATEWAY_ENDPOINT_URL');
        });

        test('Should call get method from config', () => {
            expect(config.get).toHaveBeenCalledWith('MYGATEWAY_AUTHENTICATION_TOKEN');
        });

        test('Should call get method from config', () => {
            expect(config.get).toHaveBeenCalledWith('MYGATEWAY_API_KEY');
        });



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

        test('Should return body from http response', () => {
            expect(returnValue).toEqual(axiosResponse.data);
        });
    });

    describe('When getIssuedPDAsGQL method called', () => {
        let returnValue: string;

        beforeAll(() => {
            returnValue = service['getIssuedPDAsGQL']();
        });

        test('Should be defined', () => {
            expect(service['getIssuedPDAsGQL']).toBeDefined();
        });

        test('Should return getSpace graphQL query', () => {
            expect(returnValue).toBe(
                `
    query getPDAs($org_gateway_id: String!, $take: Float!, $skip: Float!) {
        issuedPDAs(
            filter: { organization: { type: GATEWAY_ID, value: $org_gateway_id } }
            take: $take
            skip: $skip
            order: { issuanceDate: "ASC" }
        ) {
            id
            arweaveUrl
            dataAsset {
                claim
                claimArray {
                    type
                    value
                    property
                }
                owner {
                    gatewayId
                }
            }
        }
    }`
            );
        });

    });

    describe('When getIssuedPDACountGQL method called', () => {
        let returnValue: string;

        beforeAll(() => {
            returnValue = service['getIssuedPDACountGQL']();
        });

        test('Should be defined', () => {
            expect(service['getIssuedPDACountGQL']).toBeDefined();
        });

        test('Should return IssuedPDACount graphQL query', () => {
            expect(returnValue).toBe(
                `
    query IssuedPDAsCount($org_gateway_id: String!) {
        issuedPDAsCount(
            filter: { organization: { type: GATEWAY_ID, value: $org_gateway_id } }
        )
    }`
            );
        });
    });

    describe('When pagination method called', () => {
        test("Should return pagination when max's value less or equal that 15", () => {
            expect(service['pagination'](14)).toEqual([{ take: 14, skip: 0 }]);
            expect(service['pagination'](15)).toEqual([{ take: 15, skip: 0 }]);
        });

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

    describe('When getIssuedPDAs methos called', () => {
        test('Should be defined', () => {
            expect(service.getIssuedPDAs).toBeDefined();
        })
    })


})