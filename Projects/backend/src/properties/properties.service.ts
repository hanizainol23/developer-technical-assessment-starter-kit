import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PropertiesService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    const res = await this.db.query(
      'SELECT id, name, price, image_urls, location_city, location_neighborhood, sq_ft_or_area FROM properties ORDER BY id DESC LIMIT 50',
    );
    return res.rows;
  }

  async findOne(id: number) {
    const res = await this.db.query('SELECT * FROM properties WHERE id = $1', [id]);
    return res.rows[0] || null;
  }
}
