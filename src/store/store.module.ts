import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArweaveModule } from '@common/arweave/arweave.module';
import { StoreService } from './store.service';

@Module({
  imports: [
    ArweaveModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          url: config.get<string>('IRYS_NETWORK_URL'),
          token: 'matic',
          key: config.get<string>('POLYGON_WALLET_PRIVATE_KEY'),
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
  ],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
