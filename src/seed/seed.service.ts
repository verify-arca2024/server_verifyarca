import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { Country } from 'src/countries/entities/country.model';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<Country>,
  ) {}

  async seedCountries() {
    try {
      // Array de URLs de los endpoints que deseas consumir
      const endpoints = [
        'https://restcountries.com/v3.1/subregion/South%20America',
        'https://restcountries.com/v3.1/subregion/Central%20America',
        'https://restcountries.com/v3.1/subregion/Caribbean',
        'https://restcountries.com/v3.1/subregion/Europe',
        // Agrega más endpoints si es necesario
      ];

      // Array para almacenar los datos de los países de todos los endpoints
      let countriesToCreate = [];

      // Iterar sobre cada endpoint y hacer la solicitud HTTP
      for (const endpoint of endpoints) {
        const response = await axios.get(endpoint);
        const countriesData = response.data;

        // Mapeamos la respuesta de cada endpoint para extraer los datos necesarios
        const countriesFromEndpoint = countriesData.map((country: any) => {
          const phoneCode = country.idd
            ? `${country.idd.root}${country.idd.suffixes[0]}`
            : null;
          return {
            name: country.name.common,
            isoCode: country.cca2,
            phoneCode: phoneCode,
            flagImageUrl: country.flags.png,
          };
        });

        // Concatenamos los datos de los países del endpoint actual al array principal
        countriesToCreate = countriesToCreate.concat(countriesFromEndpoint);
      }

      // Eliminamos los países existentes en la base de datos
      await this.countryModel.deleteMany({});
      // Insertamos los países en la base de datos
      const createdCountries =
        await this.countryModel.insertMany(countriesToCreate);

      return createdCountries;
    } catch (error) {
      // Manejo de errores
      console.error('Error seeding countries:', error.message);
      throw new Error('Error seeding countries');
    }
  }
}
