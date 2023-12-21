import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Seeder')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  execute() {
    return this.seedService.run();
  }
}
