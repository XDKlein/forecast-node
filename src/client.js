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

  buildSession(data, userId = 0) {
    return {
      tag: this.config.tag,
      user_id: String(data.message?.from.id || userId),
      timestamp: Date.now(),
      source: "node-sdk",
    }
  }

  buildEvent(data) {
    return {
      event_name: "message",
      timestamp: Date.now(),
      tag: this.config.tag,
      user_id: String(data.message?.from.id || 0),
      page_url: "no_url",
      //session_id: sessionData.session_id,
      parameters: {
        username: String(data.message?.from.username || ""),
        firstname: String(data.message?.from.first_name || ""),
        lastname: String(data.message?.from.last_name || ""),
        is_premium: String(Boolean(data.message?.from.is_premium)),
        language: String(data.message?.from.language_code || ""),

        message_id: String(data.message?.message_id || ""),
        chat_id: String(data.message?.chat?.id || ""),
        chat_type: String(data.message?.chat?.type || ""),
        text: String(data.message?.text || ""),
        date: String(data.message?.date || ""),

        query_id: String(data.inline_query?.id || ""),
        query: String(data.inline_query?.query || ""),
        offset: String(data.inline_query?.offset || "")
      }
    }
  }

  async collect(eventName, payload = {}) {
    try {
      Object.keys(payload).forEach((key) => {
        payload[key] = String(payload[key]);
      });

      if (!payload.user_id) throw new Error('User ID is not provided.')

      const sessionData = this.buildSession({}, payload.user_id);

      const eventData = {
        event_name: eventName,
        timestamp: Date.now(),
        tag: this.config.tag,
        user_id: sessionData.user_id,
        page_url: "no_url",
        parameters: stringPayload,
      };

      await this._request("POST", "/collect", { sessionData, eventData });
    } catch (error) {
      console.error("Analytics error:", error);
    }
  }

  async collectTelegramEvent(data) {
    try {
      const parsedData = this.parseTelegramData(data);

      const collectBody = {
        sessionData: this.buildSession(parsedData),
        eventData: this.buildEvent(parsedData)
      };

      const result = await this._request("POST", "/collect", collectBody);
    } catch (error) {
      console.error("Analytics error.\n", error);
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

    if (!response.ok) {
      throw new Error(`Request failed: ${await response.text()}`);
    }
    return response.json();
  }
}

module.exports = ForecastClient;