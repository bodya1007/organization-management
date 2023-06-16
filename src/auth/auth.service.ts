import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async generateToken(user: User): Promise<string> {
    const secretKey = process.env.JWT_SECRET;
    const payload = { id: user.id, role: user.role };
    const options = { expiresIn: '1h' };
    const token = this.jwtService.sign(payload, {
      secret: secretKey,
      ...options,
    });

    return token;
  }
  async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async login(name: string, password: string): Promise<string> {
    const user = await this.validateUser(name, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.generateToken(user);
    return token;
  }

  async validateUser(name: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { name } });

    if (user && (await this.comparePasswords(password, user.password))) {
      return user;
    }

    return null;
  }
}
