import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { format } from 'winston';
import LokiTransport from 'winston-loki';
import { AllExceptionsFilter } from '@common/filters/all-exception.filter';
import { WinstonModule } from '@common/winston/winston.module';
import { winstonConsoleTransport } from '@common/winston/winston.utils';
import { PDAModule } from './pda/pda.module';
import { ScoringModule } from './scoring/scoring.module';
import { StoreModule } from './store/store.module';
import { CoreService } from './core.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WinstonModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const grafanaServiceName = config.get<string>('GRAFANA_SERVICE_NAME');
        const lokiAuth = config.get<string>('GRAFANA_LOKI_AUTH');

        return {
          level: config.get<string>('DEBUG_MODE') === 'true' ? 'debug' : 'info',
          format: format.combine(
            format.ms(),
            format.timestamp(),
            format.json(),
          ),
          transports:
            config.get<string>('NODE_ENV') === 'production'
              ? [
                  new LokiTransport({
                    host: config.get<string>('GRAFANA_LOKI_HOST'),
                    basicAuth: lokiAuth?.length > 0 ? lokiAuth : undefined,
                    format: format.json(),
                    labels: {
                      serviceName:
                        grafanaServiceName?.length > 0
                          ? grafanaServiceName
                          : 'pokt-governance-backend',
                    },
                  }),
                  winstonConsoleTransport,
                ]
              : [winstonConsoleTransport],
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    PDAModule,
    ScoringModule,
    StoreModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    CoreService,
  ],
})
export class CoreModule {}
