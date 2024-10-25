import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

describe('AppController unit testing ', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
      imports: [
        CacheModule.register(),
        HttpModule,
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  it('Debe retornar la probabilidad de cada pais', (done) => {
    const dto = {
      name: 'sergio',
      minProbability: 1,
    };

    appController.get_probability_from_name(dto).subscribe((response) => {
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('country');
      expect(Array.isArray(response.country)).toBe(true);
      expect(response.country[0]).toHaveProperty('country_id');
      expect(response.country[0]).toHaveProperty('probability');
      expect(response.country[0].probability).toBeGreaterThanOrEqual(
        dto.minProbability / 100,
      );

      done();
    });
  });

  it('debe retornar el valor sin el parametro minProbability', (done) => {
    const dto = {
      name: 'sergio',
    };

    appController.get_probability_from_name(dto).subscribe((response) => {
      expect(response).toHaveProperty('name');
      expect(response).toHaveProperty('country');
      expect(Array.isArray(response.country)).toBe(true);
      expect(response.country[0]).toHaveProperty('country_id');
      expect(response.country[0]).toHaveProperty('probability');

      done();
    });
  });
  it('debe cachear el valor de la consulta', async () => {
    const dto = {
      name: 'sergio',
      minProbability: 1,
    };

    const startTime = Date.now();
    const firstResponse = await lastValueFrom(
      appController.get_probability_from_name(dto),
    );
    const firstDuration = Date.now() - startTime;

    expect(firstResponse).toHaveProperty('name');
    expect(firstResponse).toHaveProperty('country');

    const secondStartTime = Date.now();
    const secondResponse = await lastValueFrom(
      appController.get_probability_from_name(dto),
    );
    const secondDuration = Date.now() - secondStartTime;

    expect(secondDuration).toBeLessThan(firstDuration);

    expect(secondResponse).toEqual(firstResponse);
  });
});
