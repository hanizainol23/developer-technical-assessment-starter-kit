import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'last_login', type: 'timestamptz', nullable: true })
  lastLogin: Date;
}
