import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AccommodationsModule } from './modules/accommodations/accommodations.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { StorageModule } from './modules/storage/storage.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Logger
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          transport:
            configService.get('NODE_ENV') !== 'production'
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,
          level: configService.get('LOG_LEVEL', 'info'),
          autoLogging: true,
          redact: ['req.headers.authorization', 'req.headers.cookie'],
        },
      }),
    }),

    // Database
    PrismaModule,

    // Global modules
    StorageModule,

    // Feature modules
    AuthModule,
    UsersModule,
    AccommodationsModule,
    ExchangeRatesModule,
    FavoritesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
