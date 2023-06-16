import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entity/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.dev', '.env.stage', '.env.prod'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'mysql',
        host: process.env.TYPEORM_DB_HOST,
        port: Number(process.env.TYPEORM_DB_PORT),
        username: process.env.TYPEORM_DB_USER,
        password: process.env.TYPEORM_DB_PASSWORD,
        database: process.env.TYPEORM_DB_NAME,
        entities: [User],
        synchronize: true,
      }),
    }),
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
