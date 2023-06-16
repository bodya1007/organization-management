import { MigrationInterface, QueryRunner } from 'typeorm';
import { User, UserRole } from '../user/entity/user.entity';
import * as bcrypt from 'bcrypt';

export class AddUsersData1623628673785 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.connection.getRepository(User);

    // Створення користувачів
    const adminUser = new User();
    adminUser.name = 'Admin';
    adminUser.password = 'admin123';
    adminUser.password = await bcrypt.hash(adminUser.password, 10);
    adminUser.role = UserRole.Administrator;

    const bossUser = new User();
    bossUser.name = 'Boss';
    bossUser.password = 'boss456';
    bossUser.password = await bcrypt.hash(bossUser.password, 10);
    bossUser.role = UserRole.Boss;
    bossUser.boss = adminUser;

    const user3 = new User();
    user3.name = 'User3';
    user3.password = 'user123';
    user3.password = await bcrypt.hash(user3.password, 10);
    user3.role = UserRole.RegularUser;
    user3.boss = bossUser;

    const user4 = new User();
    user4.name = 'User4';
    user4.password = 'user456';
    user4.password = await bcrypt.hash(user4.password, 10);
    user4.role = UserRole.RegularUser;
    user4.boss = bossUser;

    const bossUser2 = new User();
    bossUser2.name = 'Boss2';
    bossUser2.password = 'boss789';
    bossUser2.password = await bcrypt.hash(bossUser2.password, 10);
    bossUser2.role = UserRole.Boss;
    bossUser2.boss = adminUser;

    const user6 = new User();
    user6.name = 'User6';
    user6.password = 'user789';
    user6.password = await bcrypt.hash(user6.password, 10);
    user6.role = UserRole.RegularUser;
    user6.boss = bossUser2;

    const bossUser3 = new User();
    bossUser3.name = 'boss3';
    bossUser3.password = 'boss120';
    bossUser3.password = await bcrypt.hash(bossUser3.password, 10);
    bossUser3.role = UserRole.Boss;
    bossUser3.boss = adminUser;

    const user8 = new User();
    user8.name = 'User8';
    user8.password = 'user789';
    user8.password = await bcrypt.hash(user8.password, 10);
    user8.role = UserRole.RegularUser;
    user8.boss = bossUser3;

    const user9 = new User();
    user9.name = 'User9';
    user9.password = 'user789';
    user9.password = await bcrypt.hash(user9.password, 10);
    user9.role = UserRole.RegularUser;
    user9.boss = bossUser3;

    const user10 = new User();
    user10.name = 'User10';
    user10.password = 'user789';
    user10.password = await bcrypt.hash(user10.password, 10);
    user10.role = UserRole.RegularUser;
    user10.boss = bossUser3;

    // Збереження користувачів
    await userRepository.save([
      adminUser,
      bossUser,
      user3,
      user4,
      bossUser2,
      user6,
      bossUser3,
      user8,
      user9,
      user10,
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.connection.getRepository(User);

    // Видалення користувачів
    const users = await userRepository.find();
    await userRepository.remove(users);
  }
}
