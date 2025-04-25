import { DataSource } from 'typeorm';
import { Treasury } from './modules/user/entities/treasury.entity';
import { Asset } from './modules/user/entities/asset.entity';
import { Transaction } from './modules/user/entities/transaction.entity';
import { Budget } from './modules/user/entities/budget.entity';
import { Allocation } from './modules/user/entities/allocation.entity';
import { RiskAssessment } from './modules/user/entities/risk_assessment.entity';
import { AuditLog } from './modules/user/entities/audit_log.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '',
  database: 'treasury_db',
  entities: [
    Treasury,
    Budget,
    Asset,
    Transaction,
    Allocation,
    RiskAssessment,
    AuditLog,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: 'migrations',
});

AppDataSource.initialize()
  .then(async () => {
    await AppDataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    console.log('Connected to the database with uuid-ossp enabled!');
  })
  .catch((error) => console.log('Oops, something’s wrong:', error));
