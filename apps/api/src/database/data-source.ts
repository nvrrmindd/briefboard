import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Brief } from '../entities/brief.entity';
import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';

// Loaded by the TypeORM CLI (migrations) and by the seed script.
// The Nest app builds the same options in app.module.ts.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Brief, Project],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false, // schema changes only through migrations
};

export default new DataSource(dataSourceOptions);
