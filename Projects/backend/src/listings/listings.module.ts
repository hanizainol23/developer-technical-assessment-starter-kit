import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ListingsService],
  controllers: [ListingsController],
})
export class ListingsModule {}
