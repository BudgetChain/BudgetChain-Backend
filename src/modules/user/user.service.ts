import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './enums/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByWallet(walletAddress: string): Promise<User | null> {
    return this.userRepository.findOne({ 
      where: { starknetWallet: walletAddress } 
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    if (userData.passwordHash) {
      userData.passwordHash = await bcrypt.hash(userData.passwordHash, 10);
    }
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateRoles(userId: string, roles: UserRole[]): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.roles = roles;
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}