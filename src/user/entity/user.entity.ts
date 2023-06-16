import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { MaxLength, MinLength } from 'class-validator';

export enum UserRole {
  Administrator = 'administrator',
  Boss = 'boss',
  RegularUser = 'regular',
}

@Entity({ name: 'User' })
export class User {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @Column()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.RegularUser,
  })
  role: UserRole;

  @ManyToOne(() => User, (user) => user.subordinates)
  boss: User;

  @OneToMany(() => User, (user) => user.boss)
  subordinates: User[];
}
