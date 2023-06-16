import { DataSource } from 'typeorm';
import { User } from './user/entity/user.entity';

export const dataSource: DataSource = new DataSource({
  type: 'mysql',
  host: process.env.TYPEORM_DB_HOST || 'localhost',
  port: parseInt(process.env.TYPEORM_DB_PORT, 10) || 3306,
  username: process.env.TYPEORM_DB_USER || 'root',
  password: process.env.TYPEORM_DB_PASSWORD || 'password',
  database: process.env.TYPEORM_DB_NAME || 'organizationmanagement',
  entities: [User],
  migrations: ['src/migration/*.ts'],
  synchronize: true,
});
