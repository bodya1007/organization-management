import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Headers,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangeUserBossDto } from './dto/change-user-boss-dto';
import { User } from './entity/user.entity';
import { AuthGuard } from '../auth/auth.guard';
import { UserValidationPipe } from '../pipe/user.pipe';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new UserValidationPipe())
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Post('change-boss')
  @UseGuards(AuthGuard)
  async changeUserBoss(
    @Body() changeUserBossDto: ChangeUserBossDto,
    @Headers('Authorization') authToken: string,
  ): Promise<User> {
    return this.userService.changeUserBoss(changeUserBossDto, authToken);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllUsers(
    @Headers('Authorization') authToken: string,
  ): Promise<User[]> {
    return this.userService.getAllUsers(authToken);
  }
}
