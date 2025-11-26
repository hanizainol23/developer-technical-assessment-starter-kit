import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AgentContact } from '../entities/agent-contact.entity';
import { AgentContactsController } from './agent-contacts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgentContact]), AuthModule],
  controllers: [AgentContactsController],
})
export class AgentContactsModule {}
