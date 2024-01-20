import Irys from '@irys/sdk';
import { Test, TestingModule } from '@nestjs/testing';
import { ArweaveTag } from '../interfaces/arweave.interface';
import { ArweaveProvider } from '../arweave.provider';
import { IRYS_CONNECTOR } from '../arweave.constant';

describe('Arweave Provider', () => {
  let provider: ArweaveProvider;
  let irys: Irys;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IRYS_CONNECTOR,
          useValue: {
            getPrice: jest.fn(),
            fund: jest.fn(),
            upload: jest.fn(() =>
              Promise.resolve({ id: 'mockedTransactionId' }),
            ),
          },
        },
        ArweaveProvider,
      ],
    }).compile();

    provider = module.get<ArweaveProvider>(ArweaveProvider);
    irys = module.get<Irys>(IRYS_CONNECTOR);
  });

  test('Should be defined', () => {
    // Assert
    expect(provider).toBeDefined();
  });

  describe('calculateSizeOfData', () => {
    let data: string;
    let tags: Array<ArweaveTag>;
    beforeEach(() => {
      data = '';
      tags = [
        {
          name: '',
          value: '',
        },
      ];
    });
    test('Should be defined', () => {
      // Assert
      expect(provider['calculateSizeOfData']).toBeDefined();
    });
    test('Should loop on tags and calculate them and return number 20', () => {
      // Arrange
      data = 'data';
      tags = [
        {
          name: 'name',
          value: 'vaue',
        },
        {
          name: 'name',
          value: 'vaue',
        },
      ];

      // Assert
      expect(provider['calculateSizeOfData'](data, tags)).toEqual(20);
    });
  });

  describe('fundNodeBasedOnSize', () => {
    let size: number;
    test('Should be defined', () => {
      expect(provider['fundNodeBasedOnSize']).toBeDefined();
    });
    test('Should call getPrice with correct paremeter', () => {
      // Arrange
      size = 10;

      // Act
      provider['fundNodeBasedOnSize'](size);

      // Assert
      expect(irys.getPrice).toHaveBeenCalledWith(size);
    });
  });

  describe('storeData', () => {
    let data: Record<string, any>;
    let tags: Array<ArweaveTag>;
    let returnValue;
    test('Should be defined', () => {
      // Assert
      expect(provider.storeData).toBeDefined();
    });
    test('Should return "mockedTransactionId"', async () => {
      // Arrange
      data = { id: 'id' };
      tags = [
        {
          name: 'name',
          value: 'vaue',
        },
      ];

      // Act
      returnValue = await provider.storeData(data, tags);

      // Assert
      expect(returnValue).toBe('mockedTransactionId');
    });
  });
});
