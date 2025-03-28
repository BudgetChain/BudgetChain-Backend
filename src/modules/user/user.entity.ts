import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from './enums/user-role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.USER]
  })
  roles: UserRole[];

  @Column({ name: 'starknet_wallet', nullable: true, unique: true })
  starknetWallet: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}