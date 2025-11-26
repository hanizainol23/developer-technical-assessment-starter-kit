import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [LandsController],
  providers: [LandsService],
})
export class LandsModule {}
