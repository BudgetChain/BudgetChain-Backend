import { Injectable, Inject } from '@nestjs/common';
import { RpcProvider, ec } from 'starknet';
import { LoggingService } from '../../config/logging.service';
import {
  ExternalServiceError,
  formatErrorMessage,
} from 'src/shared/erros/app-error';

@Injectable()
export class StarknetService {
  private provider: RpcProvider;

  constructor(
    @Inject(LoggingService) // Use forwardRef to resolve LoggingService
    private logger: LoggingService,
  ) {
    if (!this.logger) {
      throw new Error('LoggingService is not provided');
    }
    this.logger.setContext('StarknetService');

    // Initialize Starknet provider with corrected configuration
    try {
      this.provider = new RpcProvider({
        nodeUrl: 'https://alpha-mainnet.starknet.io', // Replace with the appropriate network URL
      });
      this.logger.log('Starknet provider initialized successfully');
    } catch (error: unknown) {
      const errorMessage = formatErrorMessage(error);
      this.logger.error(
        `Failed to initialize Starknet provider: ${errorMessage}`,
      );
      throw new ExternalServiceError(
        'Starknet',
        `Provider initialization failed: ${errorMessage}`,
      );
    }
  }

  /**
   * Verify a Starknet signature
   * @param walletAddress The wallet address to verify against
   * @param signature The signature to verify
   * @param message The original message that was signed
   * @returns boolean indicating if the signature is valid
   */
  verifySignature(
    walletAddress: string,
    signature: string,
    message: string,
  ): boolean {
    try {
      // Convert message to hash using the Pedersen hash
      const messageHash = ec.starkCurve.pedersen(
        BigInt(0),
        BigInt(Buffer.from(message).toString('hex')),
      );

      // Verify the signature using the StarkNet library
      const isValid = ec.starkCurve.verify(
        signature,
        messageHash.toString(),
        walletAddress,
      );

      this.logger.debug(
        `Signature verification result for wallet ${walletAddress}: ${isValid}`,
      );
      return isValid;
    } catch (error: unknown) {
      const errorMessage = formatErrorMessage(error);
      this.logger.error(`Error verifying Starknet signature: ${errorMessage}`);
      // We return false instead of throwing an error to handle signature verification failures gracefully
      return false;
    }
  }

  /**
   * Get the current block number from the Starknet network
   * @returns The current block number
   * @throws ExternalServiceError if the operation fails
   */
  async getBlockNumber(): Promise<bigint> {
    try {
      const blockNumber = BigInt(await this.provider.getBlockNumber()); // Convert the block number to bigint
      this.logger.debug(`Current block number: ${blockNumber}`);
      return blockNumber;
    } catch (error: unknown) {
      const errorMessage = formatErrorMessage(error);
      this.logger.error(`Error getting block number: ${errorMessage}`);
      throw new ExternalServiceError(
        'Starknet',
        `Failed to get block number: ${errorMessage}`,
      );
    }
  }

  /**
   * Get transaction details by hash
   * @param txHash The transaction hash
   * @returns The transaction details
   * @throws ExternalServiceError if the operation fails
   */
  async getTransaction(txHash: string): Promise<unknown> {
    try {
      const transaction = await this.provider.getTransactionByHash(txHash); // Fetch transaction details
      this.logger.debug(`Retrieved transaction: ${txHash}`);
      return transaction;
    } catch (error: unknown) {
      const errorMessage = formatErrorMessage(error);
      this.logger.error(
        `Error retrieving transaction ${txHash}: ${errorMessage}`,
      );
      throw new ExternalServiceError(
        'Starknet',
        `Failed to retrieve transaction: ${errorMessage}`,
      );
    }
  }
}
