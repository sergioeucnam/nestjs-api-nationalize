import {
  Controller,
  Get,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateNamePredictionDto } from './dto/get_probability_prediction.dto';
import { Observable } from 'rxjs';
import { GetProbabilityPredictionResponse } from './interfaces/get-probability-prediction-response.interface';
import { HttpExceptionFilter } from './common/http/http-filter';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { HttpCacheInterceptor } from './common/http/http-interceptor';

@Controller()
@UseInterceptors(HttpCacheInterceptor)
@UseFilters(HttpExceptionFilter)
@UseGuards(ApiKeyGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('name-prediction')
  get_probability_from_name(
    @Query() query: CreateNamePredictionDto,
  ): Observable<GetProbabilityPredictionResponse> {
    const { name, minProbability } = query;
    return this.appService.get_probability_from_name(name, minProbability);
  }
}
