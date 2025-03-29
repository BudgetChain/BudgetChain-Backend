import { Injectable } from '@nestjs/common';
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

  async findByEmail(email: string) {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error finding user by email: ${error.message}`);
      } else {
        console.error('An unknown error occurred while finding user by email');
      }
      throw error; // Re-throw the error after logging
    }
  }

  /**
   * Finds a user by their Starknet wallet address.
   */
  async findByWallet(walletAddress: string) {
    try {
      return await this.userRepository.findOne({
        where: { starknetWallet: walletAddress },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error finding user by wallet: ${error.message}`);
      } else {
        console.error('An unknown error occurred while finding user by wallet');
      }
      throw error; // Re-throw the error after logging
    }
  }

  async create(userData: Partial<User>) {
    try {
      if (userData.passwordHash) {
        userData.passwordHash = await bcrypt.hash(userData.passwordHash, 10);
      }
      const user = this.userRepository.create(userData);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error creating user: ${error.message}`);
      } else {
        console.error('An unknown error occurred while creating user');
      }
      throw error; // Re-throw the error after logging
    }
  }

  async updateRoles(userId: string, roles: string[]) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Validate and convert roles to UserRole[]
      user.roles = this.validateRoles(roles);

      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error updating user roles: ${error.message}`);
      } else {
        console.error('An unknown error occurred while updating user roles');
      }
      throw error; // Re-throw the error after logging
    }
  }

  async findAll() {
    try {
      return await this.userRepository.find();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error fetching users: ${error.message}`);
      } else {
        console.error('An unknown error occurred while fetching users');
      }
      throw error; // Re-throw the error after logging
    }
  }

  /**
   * Validates that all input roles are valid members of the UserRole enum.
   * Throws an error if any role is invalid.
   */
  private validateRoles(inputRoles: string[]): UserRole[] {
    return inputRoles.map((role) => {
      if (Object.values(UserRole).includes(role as UserRole)) {
        return role as UserRole;
      }
      throw new Error(`Invalid role: ${role}`);
    });
  }
}
