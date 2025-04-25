import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('database').host,
  port: configService.get('database').port,
  username: configService.get('database').user,
  password: configService.get('database').password,
  database: configService.get('database').name,
  entities: ['src/modules/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false // Use migrations instead of auto-sync
});