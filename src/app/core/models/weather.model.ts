export interface WeatherSnapshot {
  temperatureC: number;
  windSpeedKmh: number;
  windDirection?: string;
  humidityPct: number;
  precipitationMm: number;
  conditions: string;
}

export interface WeatherRecord {
  id: string;
  systemId: string;
  date: string;
  weather: WeatherSnapshot;
}
