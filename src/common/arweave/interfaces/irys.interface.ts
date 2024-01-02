import { IrysConfig } from '@irys/sdk/build/cjs/common/types';

export interface IrysOptions {
  url: 'node1' | 'node2' | 'devnet' | string;
  token: string;
  key?: any;
  config?: IrysConfig;
}
