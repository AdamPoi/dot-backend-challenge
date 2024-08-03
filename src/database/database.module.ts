import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Global, Module } from '@nestjs/common';
import { join } from 'path';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        try {
          const dataSource = new DataSource({
            type: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            synchronize: true,
            entities: [__dirname + '/../**/*.entity.js'],
          });
          await dataSource.initialize();
          console.log('Database successfully connected');
          return dataSource;
        } catch (error) {
          console.log('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
