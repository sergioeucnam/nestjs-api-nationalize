export interface GetProbabilityPredictionResponse {
  name: string;
  country: Country[] | null;
}

export interface Country {
  country_id?: string;
  probability: number;
}
