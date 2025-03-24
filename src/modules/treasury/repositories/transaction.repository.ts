import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }

  async findById(id: string): Promise<Transaction> {
    return this.transactionRepository.findOne({ where: { id } });
  }

  async findByTreasuryId(treasuryId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({ where: { treasuryId } });
  }

  async create(transaction: Partial<Transaction>): Promise<Transaction> {
    const newTransaction = this.transactionRepository.create(transaction);
    return this.transactionRepository.save(newTransaction);
  }

  async update(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    await this.transactionRepository.update(id, transaction);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.transactionRepository.delete(id);
  }
}