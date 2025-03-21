declare module 'forecast-node' {
  export interface TelegramUser {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    is_premium?: boolean;
    language_code?: string;
  }

  export interface TelegramChat {
    id: number;
    type: 'private' | 'group' | 'supergroup' | 'channel';
  }
  export interface TelegramMessage {
    message_id: number;
    from?: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
    edit_date?: number;
  }

  export interface TelegramInlineQuery {
    id: string;
    from: TelegramUser;
    query: string;
    offset: string;
  }

  export interface TelegramData {
    message?: TelegramMessage;
    edited_message?: TelegramMessage;
    inline_query?: TelegramInlineQuery;
  }
  export class ForecastClient {
    constructor(tag: string);
    collectTelegramEvent(data: TelegramData): Promise<void>;
    collect(
      eventName: string,
      payload?: Record<string, unknown>
    ): Promise<void>;
  }
}