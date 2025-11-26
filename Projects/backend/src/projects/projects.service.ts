import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProjectsService {
  constructor(private db: DatabaseService) {}

  async findOne(id: number) {
    const res = await this.db.query('SELECT * FROM projects WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
}
