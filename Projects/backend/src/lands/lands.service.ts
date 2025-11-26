import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class LandsService {
  constructor(private db: DatabaseService) {}

  async findOne(id: number) {
    const res = await this.db.query('SELECT * FROM lands WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
}
