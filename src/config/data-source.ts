// import { DataSource } from 'typeorm';
// import { ConfigService } from '@nestjs/config';

// const configService = new ConfigService();

// export default new DataSource({
//   type: 'postgres',
//   host: configService.get('database').host as string,
//   port: configService.get('database').port as number,
//   username: configService.get('database').user as string,
//   password: configService.get('database').password as string,
//   database: configService.get('database').name as string,
//   entities: ['src/modules/**/*.entity.ts'],
//   migrations: ['src/migrations/*.ts'],
//   synchronize: false, // Use migrations instead of auto-sync
// });

import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

// Define the structure of the database configuration
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

const configService = new ConfigService();

// Retrieve the database configuration with a type assertion
const database = configService.get('database') as DatabaseConfig;

export default new DataSource({
  type: 'postgres',
  host: database.host,
  port: database.port,
  username: database.user,
  password: database.password,
  database: database.name,
  entities: ['src/modules/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Use migrations instead of auto-sync
});
