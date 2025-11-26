import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private db: DatabaseService) {}

  async create(dto: CreateContactDto) {
    const res = await this.db.query(
      `INSERT INTO contacts (name, email, message, property_id) VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
      [dto.name, dto.email, dto.message, dto.property_id || null],
    );
    return res.rows[0];
  }
}
