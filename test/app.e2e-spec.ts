import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

const TIME = {
  FIVE_MINUTES: 300000,
  TEN_MINUTES: 600000,
  ONE_MINUTE: 60000,
  SIX_MINUTES: 360000,
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('Solicitar una ruta sin tener la API_KEY debe retornar 401 (GET)', () => {
    return request(app.getHttpServer())
      .get('/name-prediction/?name=ricardo&minProbability=5')
      .expect(401);
  });
  it(
    'Hacer una consulta de los mismos parametros en menos de 5 minutos debe ser 95% mas rapida al estar cacheada (GET)',
    async () => {
      const startTimeFirstRequest = Date.now();
      const firstResponse = await request(app.getHttpServer())
        .get('/name-prediction/?name=sergio')
        .set('x-api-key', process.env.API_KEY)
        .expect(200);
      const firstRequestDuration = Date.now() - startTimeFirstRequest;

      expect(firstResponse.body.name).toBe('sergio');
      expect(firstResponse.body.country[0]).toHaveProperty('country_id');
      expect(firstResponse.body.country[0]).toHaveProperty('probability');

      await new Promise((resolve) => setTimeout(resolve, TIME.ONE_MINUTE));

      const startTimeSecondRequest = Date.now();
      const secondResponse = await request(app.getHttpServer())
        .get('/name-prediction/?name=sergio')
        .set('x-api-key', process.env.API_KEY)
        .expect(200);
      const secondRequestDuration = Date.now() - startTimeSecondRequest;

      expect(secondResponse.body).toEqual(firstResponse.body);
      const percentage = Number(
        ((firstRequestDuration - secondRequestDuration) /
          firstRequestDuration) *
          100,
      ).toFixed(2);

      expect(Number(percentage)).toBeGreaterThan(95);
    },
    TIME.FIVE_MINUTES,
  );
  it(
    'Hacer una consulta de los mismos parametros luego de 5 minutos no debe usar cache (GET)',
    async () => {
      const startTimeFirstRequest = Date.now();
      const firstResponse = await request(app.getHttpServer())
        .get('/name-prediction/?name=alejandro&minProbability=1')
        .set('x-api-key', process.env.API_KEY)
        .expect(200);
      const firstRequestDuration = Date.now() - startTimeFirstRequest;

      expect(firstResponse.body.name).toBe('alejandro');
      expect(firstResponse.body.country[0]).toHaveProperty('country_id');
      expect(firstResponse.body.country[0]).toHaveProperty('probability');

      await new Promise((resolve) => setTimeout(resolve, TIME.FIVE_MINUTES));

      const startTimeSecondRequest = Date.now();
      const secondResponse = await request(app.getHttpServer())
        .get('/name-prediction/?name=alejandro&minProbability=1')
        .set('x-api-key', process.env.API_KEY)
        .expect(200);
      const secondRequestDuration = Date.now() - startTimeSecondRequest;

      expect(secondResponse.body).toEqual(firstResponse.body);
      const diff = Math.abs(firstRequestDuration - secondRequestDuration);
      const avg = (firstRequestDuration + secondRequestDuration) / 2;
      const percentage = (diff / avg) * 100;
      expect(Number(percentage)).toBeGreaterThanOrEqual(90);
    },
    TIME.TEN_MINUTES,
  );
  it('Hacer una consulta sin el parametro "name" debe retornar 400 (GET)', async () => {
    return await request(app.getHttpServer())
      .get('/name-prediction/')
      .set('x-api-key', process.env.API_KEY)
      .expect(400)
      .expect('Content-Type', /json/)
      .expect((response) => {
        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('message');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toContain('name no debe estar vacío');
      });
  });

  it('Hacer una consulta con el parametro minProbability mal formado debe retornar 400 (GET)', async () => {
    return await request(app.getHttpServer())
      .get('/name-prediction/?name=sergio&minProbability=abc')
      .set('x-api-key', process.env.API_KEY)
      .expect(400)
      .expect('Content-Type', /json/)
      .expect((response) => {
        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('message');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toContain(
          'minProbability must be a number string',
        );
      });
  });

  it('Consultar con el parametro minProbability fuera del rango 0 a 100 debe retornar un error', async () => {
    return await request(app.getHttpServer())
      .get('/name-prediction/?name=sergio&minProbability=101')
      .set('x-api-key', process.env.API_KEY)
      .expect(400)
      .expect('Content-Type', /json/)
      .expect((response) => {
        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('message');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toContain(
          'minProbability debe ser un número entre 0 y 100',
        );
      });
  });
  it('Consultar con el parametro name mal formado debe retornar un error', async () => {
    return await request(app.getHttpServer())
      .get('/name-prediction/?name=123')
      .set('x-api-key', process.env.API_KEY)
      .expect(400)
      .expect('Content-Type', /json/)
      .expect((response) => {
        expect(response.body).toHaveProperty('statusCode');
        expect(response.body).toHaveProperty('message');
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toContain(
          'name debe contener solo letras',
        );
      });
  });
});
