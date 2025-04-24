import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '',
  database: 'treasury_db',
  entities: ['src/modules/user/entities/treasury.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
AppDataSource.initialize()
  .then(() => console.log('Connected to the toy box!'))
  .catch((error) => console.log('Oops, something’s wrong:', error));
