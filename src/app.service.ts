import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, delay, map, retry } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import {
  Country,
  GetProbabilityPredictionResponse,
} from './interfaces/get-probability-prediction-response.interface';

@Injectable()
export class AppService {
  private url: string = '';
  constructor(private readonly httpService: HttpService) {
    this.url = process.env.NATIONALIZE_API_URL;
  }

  /**
   * Metodo que filtra los países por probabilidad
   * @param countries Array de países obtenidos por la API
   * @param minProbability Probabilidad mínima para filtrar los países
   * @param hasMinProbability Si se ha enviado un valor para minProbability
   * @returns Retorna un array de países filtrados por probabilidad
   */
  private filterCountries(
    countries: Country[],
    minProbability?: number,
    hasMinProbability?: boolean,
  ): Country[] {
    if (hasMinProbability && minProbability !== undefined) {
      return countries.filter(
        (country) => country.probability >= Number(minProbability) / 100,
      );
    }
    return countries;
  }

  /**
   * Metodo que obtiene la probabilidad de un nombre en diferentes países
   * @param name Nombre a buscar
   * @param minProbability Probabilidad mínima para filtrar los países
   * @returns Retorna un observable con la respuesta de la API
   */
  public get_probability_from_name(
    name?: string,
    minProbability?: number,
  ): Observable<GetProbabilityPredictionResponse> {
    const hasMinProbability = minProbability !== undefined;
    return this.httpService
      .get<GetProbabilityPredictionResponse>(`${this.url}?name=${name}`)
      .pipe(
        retry({
          count: 3,
          delay: (error, retryCount) => {
            Logger.warn(`Retry attempt: ${retryCount}`, this.constructor.name);
            return of(error).pipe(delay(1000));
          },
        }),
        map((response: AxiosResponse<GetProbabilityPredictionResponse>) => {
          const { data } = response;
          const filteredCountries = this.filterCountries(
            data.country,
            minProbability,
            hasMinProbability,
          );
          return {
            name: data.name,
            country: filteredCountries,
          };
        }),
        catchError((error: AxiosError) => {
          Logger.error(
            `Error code: ${error.code}, message: ${error.message}`,
            this.constructor.name,
          );
          return throwError(
            () =>
              new HttpException(
                {
                  status:
                    error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
                  message: error.message,
                },
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
              ),
          );
        }),
      );
  }
}
