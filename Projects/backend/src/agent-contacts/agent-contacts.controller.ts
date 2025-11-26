import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentContact } from '../entities/agent-contact.entity';

@Controller('agent-contact')
export class AgentContactsController {
  constructor(@InjectRepository(AgentContact) private repo: Repository<AgentContact>) {}

  @UseGuards(JwtGuard)
  @Post()
  async create(@Body() body: any, @Request() req: any) {
    // Expect body: { property_id?, name?, email?, message?, metadata? }
    const user = req.user || {};
    const row = this.repo.create({
      user_id: user.sub || null,
      name: body.name || null,
      email: body.email || null,
      message: body.message || null,
      property_id: body.property_id || null,
      request_path: req.path,
      request_body: body,
      response_status: 202,
      user_agent: req.headers['user-agent'] || null,
      ip_address: req.ip || null,
      metadata: body.metadata || {},
    });
    const saved = await this.repo.save(row);
    return { ok: true, id: saved.id };
  }
}
