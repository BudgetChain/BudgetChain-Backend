import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balance: number;
}