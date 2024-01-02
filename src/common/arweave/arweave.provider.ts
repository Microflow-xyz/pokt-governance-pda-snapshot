import Irys from '@irys/sdk';
import { Inject, Injectable } from '@nestjs/common';
import { ArweaveTag } from './interfaces/arweave.interface';
import { IRYS_CONNECTOR } from './arweave.constant';

@Injectable()
export class ArweaveProvider {
  constructor(@Inject(IRYS_CONNECTOR) private readonly irys: Irys) {}

  private calculateSizeOfData(data: string) {
    return Buffer.byteLength(data, 'utf-8');
  }

  private async fundNodeBasedOnSize(size: number) {
    const amount = await this.irys.getPrice(size);

    await this.irys.fund(amount);
  }

  async storeData(data: Record<string, any>, tags: Array<ArweaveTag>) {
    const stringifyData = JSON.stringify(data);

    // fund to Node based on uploading data size
    const sizeOfData = this.calculateSizeOfData(stringifyData);
    await this.fundNodeBasedOnSize(sizeOfData);

    const receipt = await this.irys.upload(stringifyData, { tags: tags });

    return receipt.id;
  }
}
