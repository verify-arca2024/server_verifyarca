import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CountriesSchema, Country } from 'src/countries/entities/country.model';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Country.name,
        schema: CountriesSchema,
      },
    ]),
  ],
})
export class SeedModule {}
