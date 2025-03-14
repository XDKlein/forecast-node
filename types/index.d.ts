declare module 'forecast-node' {
  export class ForecastClient {
    constructor(tag: string);
    collect(data: TelegramUpdate): Promise<any>;
  }
}