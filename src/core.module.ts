import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PDAModule } from './pda/pda.module';
import { ArweaveModule } from '@common/arweave/arweave.module';
import { CoreService } from './core.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ArweaveModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          url: config.get<string>('IRYS_NETWORK_URL'),
          token: 'matic',
          key: config.get<string>('EVM_WALLET_PRIVATE_KEY'),
          ...(config.get<string>('NODE_ENV') !== 'production'
            ? {
                config: {
                  providerUrl: config.get<string>('IRYS_RPC_PROVIDER'),
                },
              }
            : null),
        };
      },
      inject: [ConfigService],
    }),
    PDAModule,
  ],
  providers: [CoreService],
})
export class CoreModule {}
