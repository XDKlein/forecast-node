class ForecastClient {
  constructor(tag) {
    this.config = {
      tag: tag,
      apiBaseUrl: "https://analytics.dev.mind-dev.com",
    };
  }

  parseMessage(message) {
    return message ? {
      message_id: message.message_id,
      from: {
        id: message.from.id,
        first_name: message.from.first_name,
        last_name: message.from.last_name || null,
        username: message.from.username || null,
        is_bot: message.from.is_bot,
        language_code: message.from.language_code || null,
        is_premium: message.from.is_premium || null,
      },
      date: message.date,
      text: message.text
    } : null;
  }

  parseInlineQuery(query) {
    return query ? {
      entity_id: query.id,
      from: new FromUser(data.from),
      query: query.query,
      offset: query.offset,
    } : null;
  }

  parseTelegramData(data) {
    try {
      return {
        update_id: data.update_id,
        message: this.parseMessage(data.message),
        inline_query: this.parseInlineQuery(data.inline_query),
        event_source: "node-sdk"
      };
    } catch(e) {
      throw new Error("Parse error: message invalid.");
    }
  }

  buildSession(data) {
    return {
      tag: this.config.tag,
      user_id: data.message.from.id || 0,
      timestamp: Date.now(),
      source: "node-sdk",
    }
  }

  buildEvent(data) {
    return {
      event_name: "message",
      timestamp: Date.now(),
      tag: this.config.tag,
      user_id: data.message.from.id || 0,
      //session_id: sessionData.session_id,
      parameters: {
        username: data.message?.from.username || undefined,
        firstname: data.message?.from.first_name || undefined,
        lastname: data.message?.from.last_name || undefined,
        is_premium: Boolean(data.message?.from.is_premium),
        language: data.message?.from.language_code || undefined,

        message_id: data.message?.message_id || undefined,
        chat_id: data.message?.chat?.id || undefined,
        chat_type: data.message?.chat?.type || undefined,
        text: data.message?.text || undefined,
        date: data.message?.date || undefined,

        query_id: data.inline_query?.id,
        query: data.inline_query?.query,
        offset: data.inline_query?.offset
      }
    }
  }

  async collect(data) {
    try {
      const parsedData = this.parseTelegramData(data);

      const collectBody = {
        sessionData: this.buildSession(parsedData),
        eventData: this.buildEvent(parsedData)
      };

      const result = await this._request("POST", "/collect", collectBody);
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }

  async _request(method, path, data) {
    const response = await fetch(`${this.config.apiBaseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Application-ID': this.config.tag
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) throw new Error('Request failed');
    return response.json();
  }
}