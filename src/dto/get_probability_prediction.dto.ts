import {
  IsString,
  Matches,
  IsOptional,
  IsNumberString,
  IsNotEmpty,
} from 'class-validator';

export class CreateNamePredictionDto {
  @IsString({ message: 'name debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'name no debe estar vacío' })
  @Matches(/^[A-Za-z]+$/, { message: 'name debe contener solo letras' })
  name: string;

  @IsOptional()
  @IsNumberString()
  @Matches(/^(100|[1-9]?[0-9])$/, {
    message: 'minProbability debe ser un número entre 0 y 100',
  })
  minProbability?: number;
}
