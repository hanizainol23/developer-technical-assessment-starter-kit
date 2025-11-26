import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'agent_contacts' })
export class AgentContact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  property_id: number;

  @Column({ nullable: true })
  request_path: string;

  @Column({ type: 'jsonb', nullable: true })
  request_body: any;

  @Column({ nullable: true })
  response_status: number;

  @Column({ nullable: true })
  user_agent: string;

  @Column({ nullable: true })
  ip_address: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
