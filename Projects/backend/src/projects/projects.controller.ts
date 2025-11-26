import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('project')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const p = await this.service.findOne(id);
    if (!p) return { error: 'Not found' };
    return p;
  }
}
