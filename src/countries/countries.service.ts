import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country } from './entities/country.model';
import { Model } from 'mongoose';

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Country.name) private readonly countryModel: Model<Country>,
  ) {}
  async findAll() {
    return this.countryModel.find().exec();
  }
}
