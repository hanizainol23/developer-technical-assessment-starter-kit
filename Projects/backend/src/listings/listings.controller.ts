import { Controller, Get, Query } from '@nestjs/common';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly service: ListingsService) {}

  @Get('popular')
  async popular(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 6;
    return this.service.popular(n);
  }

  @Get('search')
  async search(
    @Query('q') query?: string,
    @Query('location') location?: string,
    @Query('limit') limit?: string,
  ) {
    const keyword = query || '';
    const loc = location || '';
    const n = limit ? parseInt(limit, 10) : 20;
    return this.service.search(keyword, loc, n);
  }
}
