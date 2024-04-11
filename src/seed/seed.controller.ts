import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  //@Post('countries')
  //async seedCountries() {
  //  const createdCountries = await this.seedService.seedCountries();
  //  return {
  //   message: `${createdCountries.length} countries seeded`,
  //  data: createdCountries,
  // };
  // }
}
