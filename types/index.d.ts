export class TelemetreeClient {
  constructor(tag: string);
  collect(data: TelegramUpdate): Promise<any>;
}