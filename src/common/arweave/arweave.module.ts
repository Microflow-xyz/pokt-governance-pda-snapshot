import Irys from '@irys/sdk';
import { Module } from '@nestjs/common';
import { IrysOptions } from './interfaces/irys.interface';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './arweave.module-definition';
import { ArweaveProvider } from './arweave.provider';
import { IRYS_CONNECTOR } from './arweave.constant';

@Module({
  providers: [
    {
      provide: IRYS_CONNECTOR,
      useFactory: async (options: IrysOptions) => {
        return new Irys(options);
      },
      inject: [MODULE_OPTIONS_TOKEN],
    },
    ArweaveProvider,
  ],

  exports: [ArweaveProvider],
})
export class ArweaveModule extends ConfigurableModuleClass {}
