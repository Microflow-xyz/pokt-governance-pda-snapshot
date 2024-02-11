import { NestFactory } from '@nestjs/core';
import { Handler } from 'aws-lambda';
import { WinstonProvider } from '@common/winston/winston.provider';
import { CoreModule } from './core.module';
import { CoreService } from './core.service';

export const handler: Handler = async () => {
  const app = await NestFactory.createApplicationContext(CoreModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(WinstonProvider));

  const coreService = app.get<CoreService>(CoreService);

  return await coreService.handler();
};
