import Irys from '@irys/sdk';
import { Test, TestingModule } from '@nestjs/testing';
import { BigNumber } from 'bignumber.js';
import { ArweaveTag } from '../interfaces/arweave.interface';
import { ArweaveProvider } from '../arweave.provider';
import { IRYS_CONNECTOR } from '../arweave.constant';

// Describe the test suite for the Arweave Provider
describe('Arweave Provider', () => {
  let provider: ArweaveProvider;
  let irys: Irys;
  const bign = new BigNumber('BigNumber.VALUE');

  // Setup before each test
  beforeEach(async () => {
    // Create a testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          // Mock IRYS_CONNECTOR with specific methods and values
          provide: IRYS_CONNECTOR,
          useValue: {
            getPrice: jest.fn().mockResolvedValue(bign),
            fund: jest.fn(),
            upload: jest.fn().mockResolvedValue({ id: 'id' }),
          },
        },
        ArweaveProvider,
      ],
    }).compile();

    // Initialize instances for testing
    provider = module.get<ArweaveProvider>(ArweaveProvider);
    irys = module.get<Irys>(IRYS_CONNECTOR);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  // Basic test to check if the provider is defined
  test('Should be defined', () => {
    expect(provider).toBeDefined();
  });

  // Describe the 'calculateSizeOfData' method tests
  describe('calculateSizeOfData', () => {
    let data: string;
    let tags: Array<ArweaveTag>;

    // Setup before each test
    beforeEach(() => {
      data = '';
      tags = [
        {
          name: '',
          value: '',
        },
      ];
    });

    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(provider['calculateSizeOfData']).toBeDefined();
    });

    // Test to check if the method returns 0 when inputs are empty
    test('Should return 0 when inputs are empty', () => {
      expect(provider['calculateSizeOfData'](data, tags)).toEqual(0);
    });

    // Test to check if the method loops on tags and calculates them and returns number 22
    test('Should loops on tags and calculate them and return number 22', () => {
      data = 'data';
      tags = [
        {
          name: 'name',
          value: 'value',
        },
        {
          name: 'name',
          value: 'value',
        },
      ];

      expect(provider['calculateSizeOfData'](data, tags)).toEqual(22);
    });

    // Test to check if the method calls byteLength method from Buffer
    test('Should call byteLength method from Buffer', () => {
      data = 'data';
      tags = [
        {
          name: 'name',
          value: 'value',
        },
      ];
      jest.spyOn(Buffer, 'byteLength').mockReturnValue(1);
      provider['calculateSizeOfData'](data, tags);
      expect(Buffer.byteLength).toHaveBeenCalledWith('data', 'utf-8');
      expect(Buffer.byteLength).toHaveBeenCalledWith('name', 'utf-8');
      expect(Buffer.byteLength).toHaveBeenCalledWith('value', 'utf-8');
      expect(Buffer.byteLength).toHaveBeenCalledTimes(3);
    });
  });

  // Describe the 'fundNodeBasedOnSize' method tests
  describe('fundNodeBasedOnSize', () => {
    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(provider['fundNodeBasedOnSize']).toBeDefined();
    });

    // Test to check if the method calls getPrice with correct parameter
    test('Should call getPrice with correct parameter', async () => {
      await provider['fundNodeBasedOnSize'](10);
      expect(irys.getPrice).toHaveBeenCalledWith(10);
      expect(irys.getPrice).toHaveBeenCalledTimes(1);
    });

    // Test to check if the method calls fund method from irys with correct parameter
    test('Should call fund method from irys with correct parameter', async () => {
      await provider['fundNodeBasedOnSize'](10);
      expect(irys.fund).toHaveBeenCalledTimes(1);
      expect(irys.fund).toHaveBeenCalledWith(bign);
    });
  });

  // Describe the 'storeData' method tests
  describe('storeData', () => {
    let data: Record<string, any>;
    let tags: Array<ArweaveTag>;

    // Setup before each test
    beforeEach(async () => {
      data = { id: 'id' };
      tags = [
        {
          name: 'name',
          value: 'value',
        },
      ];
    });

    // Basic test to check if the method is defined
    test('Should be defined', () => {
      expect(provider.storeData).toBeDefined();
    });

    // Test to check if the method calls stringify method from JSON
    test('Should call stringify method from JSON', async () => {
      jest.spyOn(JSON, 'stringify').mockReturnValue('');
      await provider.storeData(data, tags);
      expect(JSON.stringify).toHaveBeenCalledWith(data);
    });

    // Test to check if the method funds to Node based on uploading data size
    test('Should fund to Node based on uploading data size', async () => {
      jest.spyOn(provider as any, 'calculateSizeOfData').mockReturnValue(17);
      jest.spyOn(provider as any, 'fundNodeBasedOnSize');
      await provider.storeData(data, tags);
      expect(provider['fundNodeBasedOnSize']).toHaveBeenCalledWith(17);
    });

    // Test to check if the method returns receipt.id
    test('Should return receipt.id', async () => {
      expect(await provider.storeData(data, tags)).toEqual('id');
    });
  });
});
