import dotenv from 'dotenv';
dotenv.config();

// Helper to parse integers robustly
const toInt = (value: string | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? fallback : num;
};

// Export a factory function
export default () => ({
  env: process.env.NODE_ENV || 'development',
  name: process.env.APP_NAME || 'budget-chain-backend',
  port: toInt(process.env.PORT, 3000),
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: toInt(process.env.DATABASE_PORT, 5432),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    name: process.env.DATABASE_NAME || 'budgetchain',
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      (() => {
        throw new Error('JWT_SECRET is not defined');
      })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});
