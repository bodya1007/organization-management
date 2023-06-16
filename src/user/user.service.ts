import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangeUserBossDto } from './dto/change-user-boss-dto';
import { User } from './entity/user.entity';
import { UserRole } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { name: createUserDto.name },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this name already exists');
    }
    if (createUserDto.role == UserRole.Boss) {
      throw new UnauthorizedException(
        'User becomes a boss only when he has subordinates',
      );
    }

    const user = new User();
    user.name = createUserDto.name;
    user.password = await bcrypt.hash(createUserDto.password, 10);
    user.role = UserRole.RegularUser;

    if (createUserDto.role === UserRole.Administrator) {
      const existingAdmin = await this.userRepository.findOne({
        where: { role: UserRole.Administrator },
      });

      if (existingAdmin) {
        throw new UnauthorizedException('An administrator already exists');
      }

      user.role = UserRole.Administrator;
    }

    if (createUserDto.bossId) {
      const boss = await this.userRepository.findOne({
        where: { id: createUserDto.bossId },
      });

      if (!boss) {
        throw new NotFoundException('Boss not found');
      }
      if (boss.role !== UserRole.Administrator) {
        boss.role = UserRole.Boss;
      }

      user.boss = boss;

      await this.userRepository.save(boss);
    }

    await this.userRepository.save(user);

    return user;
  }
  async changeUserBoss(
    changeUserBossDto: ChangeUserBossDto,
    authToken: string,
  ): Promise<User> {
    const { userId, bossId } = changeUserBossDto;

    const payload = await this.verifyAuthToken(authToken);

    const boss = await this.userRepository.findOne({
      where: { id: payload.id, role: UserRole.Boss },
      relations: ['subordinates'],
    });

    if (!boss) {
      throw new NotFoundException(
        'Only boss can change the boss for subordinates',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['boss', 'subordinates', 'subordinates.subordinates'],
    });

    if (!user || !user.boss) {
      throw new NotFoundException('User or boss not found');
    }

    const userBosses = await this.getAllBosses(user);
    const userSubordinates = await this.getAllSubordinates(user);
    const isSubordinate = userBosses.some((userBoss) => {
      return userBoss.id === boss.id;
    });
    const isSubordinateOfNewBoss = userSubordinates.some(
      (subordinate) => subordinate.id === bossId,
    );

    if (isSubordinateOfNewBoss) {
      throw new BadRequestException(
        "New boss cannot have the same id as any of the user's heir",
      );
    }
    if (!isSubordinate) {
      throw new BadRequestException(
        'User is not a subordinate of the specified boss',
      );
    }

    const oldBoss = await this.userRepository.find({
      where: { id: user.boss.id },
      relations: ['subordinates'],
    });
    if (oldBoss[0].subordinates.length === 1) {
      oldBoss[0].role = UserRole.RegularUser;
    }

    const newBoss = await this.userRepository.findOne({
      where: { id: bossId },
    });

    if (!newBoss) {
      throw new NotFoundException('New boss not found');
    }

    newBoss.role = UserRole.Boss;
    user.boss = newBoss;

    await this.userRepository.save([user, newBoss, oldBoss[0]]);

    return user;
  }
  async getAllUsers(authToken: string): Promise<User[]> {
    const payload = await this.verifyAuthToken(authToken);

    switch (payload.role) {
      case UserRole.Administrator:
        return this.userRepository.find();
      case UserRole.Boss:
        const bossId = payload.id;
        const boss = await this.userRepository.findOne({
          where: { id: bossId },
          relations: ['subordinates', 'subordinates.subordinates'],
        });

        if (!boss) {
          throw new NotFoundException('Boss not found');
        }

        await this.loadNestedSubordinates(boss);

        return [boss];
      default:
        const userId = payload.id;
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        return [user];
    }
  }

  private async loadNestedSubordinates(user: User) {
    const nestedSubordinatesQuery = this.userRepository
      .createQueryBuilder('nestedUser')
      .where('nestedUser.bossId = :userId', { userId: user.id });

    const nestedSubordinates = await nestedSubordinatesQuery.getMany();

    for (const nestedSubordinate of nestedSubordinates) {
      await this.loadNestedSubordinates(nestedSubordinate);
    }

    user.subordinates = nestedSubordinates;
  }
  private async verifyAuthToken(
    authToken: string,
  ): Promise<{ role: string; id: number }> {
    const secretKey = process.env.JWT_SECRET;
    const verifyOptions: JwtVerifyOptions = { secret: secretKey };
    return this.jwtService.verify(
      authToken.replace(/^Bearer\s|"|"/g, ''),
      verifyOptions,
    ) as { role: string; id: number };
  }
  private async getAllSubordinates(
    user: User,
    subordinates: User[] = [],
  ): Promise<User[]> {
    const foundSubordinates = await this.userRepository.find({
      where: { boss: user },
    });
    subordinates.push(...foundSubordinates);

    for (const subordinate of foundSubordinates) {
      await this.getAllSubordinates(subordinate, subordinates);
    }

    return subordinates;
  }
  private async getAllBosses(user: User, bosses: User[] = []): Promise<User[]> {
    const boss = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['boss'],
    });

    if (boss && boss.boss) {
      bosses.push(boss.boss);
      return await this.getAllBosses(boss.boss, bosses);
    }
    return bosses;
  }
}
