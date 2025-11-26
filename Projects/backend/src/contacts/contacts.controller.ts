import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly service: ContactsService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateContactDto) {
    const created = await this.service.create(dto);
    return { ok: true, id: created.id, created_at: created.created_at };
  }
}
