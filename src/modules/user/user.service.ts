import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { User, type UserRole } from './entities/user.entity';
import { LoggingService } from '../../config/logging.service';
import {
  formatErrorMessage,
  NotFoundError,
  DatabaseError,
} from 'src/shared/erros/app-error';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => LoggingService)) // Use forwardRef for LoggingService
    private logger: LoggingService,
  ) {
    this.logger.setContext('UserService');
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.usersRepository.find();
      this.logger.debug(`Retrieved ${users.length} users`);
      return users;
    } catch (error) {
      this.logger.error(
        `Error retrieving all users: ${formatErrorMessage(error)}`,
      );
      throw new DatabaseError(
        `Failed to retrieve users: ${formatErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundError('User', id);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error finding user by ID ${id}: ${formatErrorMessage(error)}`,
      );
      throw new DatabaseError(
        `Failed to find user: ${formatErrorMessage(error)}`,
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });
      return user;
    } catch (error) {
      this.logger.error(
        `Error finding user by email ${email}: ${formatErrorMessage(error)}`,
      );
      throw new DatabaseError(
        `Failed to find user by email: ${formatErrorMessage(error)}`,
      );
    }
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    try {
      const user = await this.findOne(id);
      user.role = role;
      const updatedUser = await this.usersRepository.save(user);
      this.logger.log(`Updated role for user ${id} to ${role}`);
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error updating role for user ${id}: ${formatErrorMessage(error)}`,
      );
      throw new DatabaseError(
        `Failed to update user role: ${formatErrorMessage(error)}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const user = await this.findOne(id);
      await this.usersRepository.remove(user);
      this.logger.log(`Removed user ${id}`);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(
        `Error removing user ${id}: ${formatErrorMessage(error)}`,
      );
      throw new DatabaseError(
        `Failed to remove user: ${formatErrorMessage(error)}`,
      );
    }
  }
}
