import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly service: PropertiesService) {}

  @Get()
  async list() {
    return this.service.findAll();
  }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const p = await this.service.findOne(id);
    if (!p) return { error: 'Not found' };
    return p;
  }
}
