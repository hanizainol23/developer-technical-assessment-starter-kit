import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  public pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
    this.pool = new Pool({ connectionString });
  }

  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
