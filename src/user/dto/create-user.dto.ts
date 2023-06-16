import { UserRole } from '../entity/user.entity';

export class CreateUserDto {
  name: string;
  password: string;
  role: UserRole;
  bossId?: number;
}
