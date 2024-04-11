import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { CountriesSchema, Country } from './entities/country.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [CountriesController],
  providers: [CountriesService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Country.name,
        schema: CountriesSchema,
      },
    ]),
  ],
})
export class CountriesModule {}
