import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Global, Logger, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');
        try {
          const dataSource = new DataSource({
            type: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database:
              configService.get('NODE_ENV') === 'test'
                ? configService.get('DB_TEST_DATABASE')
                : configService.get('DB_DATABASE'),
            synchronize: true,
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            migrations: [__dirname + '/migrations/*{.ts,.js}'],
          });
          await dataSource.initialize();
          logger.log('Database successfully connected');
          return dataSource;
        } catch (error) {
          logger.error('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
