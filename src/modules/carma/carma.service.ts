import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OpenaiService } from "../openai/openai.service";
import { CarmaResult } from "./carma-result.entity";

@Injectable()
export class CarmaService {
  constructor(
    private readonly aiChat: OpenaiService,
    @InjectRepository(CarmaResult)
    private readonly carmaRepo: Repository<CarmaResult>,
  ) {}

  async askChat({
    uuid,
    name,
    date_of_birth,
    country,
  }: {
    uuid: string;
    name: string;
    date_of_birth: string;
    country: string;
  }) {
    const messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [
      {
        role: "system",
        content: `You are an expert karmic analyst and spiritual guide.
User:
- Name: ${name}
- Date of Birth: ${date_of_birth}
- Country of Birth: ${country}

⚠️ Output must be ONLY valid JSON:
{
  "introduction": "string",
  "main_karmic_lesson": "string",
  "repeating_patterns": "string",
  "strengths_and_talents": "string",
  "life_transformation": "string",
  "practical_recommendations": "string",
  "spiritual_practice": "string",
  "conclusion": "string"
}`,
      },
    ];

    const raw = await this.aiChat.chat(messages);

    let parsed;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      parsed = JSON.parse(raw ?? "{}");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      throw new Error("AI returned invalid JSON");
    }

    const entity = this.carmaRepo.create({
      userId: uuid,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result: parsed,
      paid: false,
    });
    await this.carmaRepo.save(entity);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return parsed;
  }

  async findByUuid(uuid: string) {
    const record = await this.carmaRepo.findOne({ where: { userId: uuid } });
    if (!record) {
      throw new NotFoundException(`No karmic result found for userId=${uuid}`);
    }
    return record;
  }
}
