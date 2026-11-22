import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DataSource, DataSourceOptions } from 'typeorm';

const envPath = resolve(process.cwd(), '.env');

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'local-db',
  entities: [join(__dirname, 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;