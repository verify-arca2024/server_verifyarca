import { Controller, Get } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}
  @Get()
  async findAll() {
    return this.countriesService.findAll();
  }
}
