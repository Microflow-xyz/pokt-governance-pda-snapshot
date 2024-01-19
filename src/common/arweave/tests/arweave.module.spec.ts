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
            upload: jest.fn(),
          },
        },
        ArweaveProvider,
      ],
    }).compile();

    provider = module.get<ArweaveProvider>(ArweaveProvider);
    irys = module.get<Irys>(IRYS_CONNECTOR);
  });

  test('Should be defined', () => {
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
});
