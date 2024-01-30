import Irys from '@irys/sdk';
import { Test, TestingModule } from '@nestjs/testing';
import { BigNumber } from 'bignumber.js';
import { ArweaveTag } from '../interfaces/arweave.interface';
import { ArweaveProvider } from '../arweave.provider';
import { IRYS_CONNECTOR } from '../arweave.constant';

describe('Arweave Provider', () => {
  let provider: ArweaveProvider;
  let irys: Irys;
  const bign = new BigNumber('BigNumber.VALUE');
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
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

    provider = module.get<ArweaveProvider>(ArweaveProvider);
    irys = module.get<Irys>(IRYS_CONNECTOR);
    jest.clearAllMocks();
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
      expect(provider['calculateSizeOfData']).toBeDefined();
    });
    test('Shouldm return 0 when inputs are empty', () => {
      expect(provider['calculateSizeOfData'](data, tags)).toEqual(0);
    });
    test('Should loop on tags and calculate them and return number 20', () => {
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

      expect(provider['calculateSizeOfData'](data, tags)).toEqual(20);
    });
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

  describe('fundNodeBasedOnSize', () => {
    test('Should be defined', () => {
      expect(provider['fundNodeBasedOnSize']).toBeDefined();
    });
    test('Should call getPrice with correct paremeter', async () => {
      await provider['fundNodeBasedOnSize'](10);
      expect(irys.getPrice).toHaveBeenCalledWith(10);
      expect(irys.getPrice).toHaveBeenCalledTimes(1);
    });
    test('Should call fund method from irys with correct paremeter', async () => {
      await provider['fundNodeBasedOnSize'](10);
      expect(irys.fund).toHaveBeenCalledTimes(1);
      expect(irys.fund).toHaveBeenCalledWith(bign);
    });
  });

  describe('storeData', () => {
    let data: Record<string, any>;
    let tags: Array<ArweaveTag>;
    beforeEach(async () => {
      data = { id: 'id' };
      tags = [
        {
          name: 'name',
          value: 'vaue',
        },
      ];
    });

    test('Should be defined', () => {
      expect(provider.storeData).toBeDefined();
    });
    test('Should call stringify method from JSON', async () => {
      jest.spyOn(JSON, 'stringify').mockReturnValue('');
      await provider.storeData(data, tags);
      expect(JSON.stringify).toHaveBeenCalledWith(data);
    });
    test('Should fund to Node based on uploading data size', async () => {
      jest.spyOn(provider as any, 'calculateSizeOfData').mockReturnValue(17);
      jest.spyOn(provider as any, 'fundNodeBasedOnSize');
      await provider.storeData(data, tags);
      expect(provider['fundNodeBasedOnSize']).toHaveBeenCalledWith(17);
    });
    test('Should return receipt.id', async () => {
      expect(await provider.storeData(data, tags)).toEqual('id');
    });
  });
});
