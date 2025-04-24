import { Repository } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType } from '../user/entities/transaction.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';


export interface TransactionRepository extends Repository<Transaction> {
  findByTreasuryAndStatus(treasuryId: string, status: TransactionStatus): Promise<Transaction[]>;
  findByType(treasuryId: string, type: TransactionType): Promise<Transaction[]>;
}

@Injectable()
export class TransactionRepositoryImpl extends Repository<Transaction> implements TransactionRepository {
  constructor(@InjectRepository(Transaction) private readonly repo: Repository<Transaction>) {
    super(repo.target, repo.manager, repo.queryRunner);
  }

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const newTransaction = this.repo.create(transaction);
    return this.repo.save(newTransaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<Transaction[]> {
    return this.repo.find();
  }

  async findByTreasuryAndStatus(treasuryId: string, status: TransactionStatus): Promise<Transaction[]> {
    return this.repo.find({ where: { treasuryId, status } });
  }

  async findByType(treasuryId: string, type: TransactionType): Promise<Transaction[]> {
    return this.repo.find({ where: { treasuryId, type } });
  }

  async updateTransaction(id: string, updateData: Partial<Transaction>): Promise<Transaction | null> {
    await this.repo.update(id, updateData);
    return this.findById(id);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}