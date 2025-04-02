import { Module } from '@nestjs/common';
import { StarknetService } from './starknet.service';
import { ConfigModule } from '../../config/config.module'; // Import ConfigModule

@Module({
  imports: [ConfigModule], // Provides LoggingService globally
  providers: [StarknetService], // No need to register LoggingService here
  exports: [StarknetService],
})
export class BlockchainModule {}
