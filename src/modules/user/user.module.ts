import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '../../config/config.module'; // Import ConfigModule

@Module({
  imports: [
    ConfigModule, // Provides LoggingService globally
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService], // No need to register LoggingService here
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
