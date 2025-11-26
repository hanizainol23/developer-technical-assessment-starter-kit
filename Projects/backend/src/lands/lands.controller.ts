import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LandsService } from './lands.service';

@Controller('land')
export class LandsController {
  constructor(private readonly service: LandsService) {}

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const p = await this.service.findOne(id);
    if (!p) return { error: 'Not found' };
    return p;
  }
}
