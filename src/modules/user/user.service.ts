// src/users/user.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { CarmaResult } from "../carma/carma-result.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(CarmaResult)
    private readonly resultsRepo: Repository<CarmaResult>,
  ) {}

  /** Создаёт пользователя, если ещё нет. Возвращает существующего, если есть. */
  async findOrCreate(email: string): Promise<User> {
    const e = email.trim().toLowerCase();
    let user = await this.usersRepo.findOne({ where: { email: e } });
    if (!user) {
      user = this.usersRepo.create({ email: e });
      user = await this.usersRepo.save(user);
    }
    return user;
  }

  /** Найти пользователя по e-mail (без ошибки, просто null если нет) */
  async findByEmail(email: string): Promise<User | null> {
    const e = email.trim().toLowerCase();
    return this.usersRepo.findOne({ where: { email: e } });
  }

  /** Найти пользователя по id, бросить 404 если нет */
  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  /** Список репортов пользователя (кратко) — для success page */
  async getReportsSummary(userId: string): Promise<
    Array<{
      id: number;
      reportUuid: string;
      paid: boolean;
      created_at: Date;
    }>
  > {
    await this.ensureUserExists(userId);
    const rows = await this.resultsRepo.find({
      where: { userId },
      select: { id: true, reportUuid: true, paid: true, created_at: true },
      order: { id: "DESC" },
    });
    return rows;
  }

  async getMe(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const reports = await this.resultsRepo.find({
      where: { userId },
      order: { created_at: "DESC" },
    });

    return {
      user: { id: user.id, email: user.email },
      reports: reports.map((r) => ({
        id: r.id,
        reportUuid: r.reportUuid,
        paid: r.paid,
        created_at: r.created_at,
        result: r.result,
      })),
    };
  }

  // --- helpers ---

  private async ensureUserExists(userId: string): Promise<void> {
    const exists = await this.usersRepo.exist({ where: { id: userId } });
    if (!exists) throw new NotFoundException("User not found");
  }
}
