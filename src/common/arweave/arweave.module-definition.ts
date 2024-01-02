import { ConfigurableModuleBuilder } from '@nestjs/common';
import { IrysOptions } from './interfaces/irys.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<IrysOptions>()
    .setClassMethodName('forRoot')
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal,
      }),
    )
    .build();
