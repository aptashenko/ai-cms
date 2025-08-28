// src/carma/carma.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OpenaiService } from "../openai/openai.service";
import { CarmaResult } from "./carma-result.entity";

export type CreateReportInput = {
  userId: string;
  reportUuid: string;
  name: string;
  date_of_birth: string;
  country: string;
};

@Injectable()
export class CarmaService {
  constructor(
    private readonly aiChat: OpenaiService,
    @InjectRepository(CarmaResult)
    private readonly carmaRepo: Repository<CarmaResult>,
  ) {}

  /** Алиас под контроллеры: createOrGetReport -> generateAndAttach */
  async createOrGetReport(input: CreateReportInput) {
    return this.generateAndAttach(input);
  }

  /** Идемпотентно создаёт (или дополняет) репорт и заполняет result контентом ИИ */
  async generateAndAttach(params: CreateReportInput) {
    const { userId, reportUuid, name, date_of_birth, country } = params;

    // 1) Проверка существующего репорта по reportUuid
    let report = await this.carmaRepo.findOne({ where: { reportUuid } });
    if (report) {
      if (report.userId !== userId) {
        throw new BadRequestException(
          "This reportUuid is already linked to another user",
        );
      }
      // если уже есть контент — просто вернём
      if (report.result && Object.keys(report.result).length > 0) {
        return report;
      }
    } else {
      // создаём «пустой» репорт для пользователя (paid: false)
      report = this.carmaRepo.create({
        userId,
        reportUuid,
        result: {}, // временно пусто, сейчас заполним
        paid: false,
      });
      report = await this.carmaRepo.save(report);
    }

    // 2) Генерация контента ИИ
    const messages = [
      {
        role: "system" as const,
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

    let parsed: Record<string, any>;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      parsed = JSON.parse(raw ?? "{}");
    } catch {
      throw new BadRequestException("AI returned invalid JSON");
    }

    // 3) Сохраняем контент в репорт и возвращаем
    report.result = parsed;
    await this.carmaRepo.save(report);
    return report;
  }

  /** Найти репорт по его reportUuid (для /report/:reportUuid) */
  async findByReportUuid(reportUuid: string) {
    const r = await this.carmaRepo.findOne({ where: { reportUuid } });
    if (!r) throw new NotFoundException("Report not found");
    return r;
  }

  /** Пометить репорт оплаченным (используется вебхуком) */
  async markPaid(reportUuid: string) {
    const report = await this.carmaRepo.findOne({ where: { reportUuid } });
    if (!report) throw new NotFoundException("Report not found");
    if (!report.paid) {
      report.paid = true;
      await this.carmaRepo.save(report);
    }
    return report;
  }
}
