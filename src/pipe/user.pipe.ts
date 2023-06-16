import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { UserRole, User } from '../user/entity/user.entity';

@Injectable()
export class UserValidationPipe implements PipeTransform {
  transform(value: any): User {
    const { name, password, role, boss, subordinates } = value;

    if (!name || !password) {
      throw new BadRequestException('Name and password are required');
    }

    if (name.length > 50 || name.length < 4) {
      throw new BadRequestException(
        'The name must be between 4 and 50 characters long',
      );
    }

    if (password.length < 6 || password.length > 20) {
      throw new BadRequestException(
        'Password must be between 6 and 20 characters long',
      );
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Invalid user role');
    }

    if (boss && typeof boss !== 'object') {
      throw new BadRequestException('Invalid boss entity');
    }

    if (subordinates && !Array.isArray(subordinates)) {
      throw new BadRequestException('Invalid subordinates array');
    }

    return value;
  }
}
