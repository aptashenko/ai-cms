import { Injectable } from "@nestjs/common";
import { OpenAI } from "openai";

@Injectable()
export class OpenaiService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    options?: { temperature?: number; max_tokens?: number },
  ) {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: options?.temperature ?? 0.8,
      max_tokens: options?.max_tokens ?? 1300,
    });

    return response.choices[0].message.content;
  }
}
