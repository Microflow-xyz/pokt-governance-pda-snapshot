import Irys from '@irys/sdk';
import { Inject, Injectable } from '@nestjs/common';
import { ArweaveTag } from './interfaces/arweave.interface';
import { IRYS_CONNECTOR } from './arweave.constant';

@Injectable()
export class ArweaveProvider {
  constructor(@Inject(IRYS_CONNECTOR) private readonly irys: Irys) {}

  /**
   * Calculate size of data in Bytes and return it
   *
   * @param data - The data string which want to calculate its size
   * @param tags - The tags list which want to calculate its size
   * @return The size of input data in Bytes
   */
  private calculateSizeOfData(data: string, tags: Array<ArweaveTag>) {
    let tagsLength = 0;
    const dataLength = Buffer.byteLength(data, 'utf-8');

    for (let index = 0; index < tags.length; index++) {
      const nameLength = Buffer.byteLength(tags[index].name, 'utf-8');
      const valueLength = Buffer.byteLength(tags[index].value, 'utf-8');

      tagsLength += nameLength + valueLength;
    }

    return dataLength + tagsLength;
  }

  /**
   * Fund the irys nodes which store our data
   *
   * @param size - Size of file in Bytes
   */
  private async fundNodeBasedOnSize(size: number) {
    const amount = await this.irys.getPrice(size);

    await this.irys.fund(amount);
  }

  /**
   * Store Data into arweave
   *
   * @param data - The data that you want to store
   * @param tags - The tags that store belong with your data and able you to search
   * @return transaction ID
   */
  async storeData(
    data: Record<string, any>,
    tags: Array<ArweaveTag>,
  ): Promise<string> {
    const stringifyData = JSON.stringify(data);

    // fund to Node based on uploading data size
    const sizeOfData = this.calculateSizeOfData(stringifyData, tags);
    await this.fundNodeBasedOnSize(sizeOfData);

    const receipt = await this.irys.upload(stringifyData, { tags: tags });

    return receipt.id;
  }
}
