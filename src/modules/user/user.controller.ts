// src/users/user.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  Param,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "./user.service";
import { CarmaService } from "../carma/carma.service";
import { RegisterDto } from "./dto/registration.dto";

@Controller("users")
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly carmaService: CarmaService,
  ) {}

  /**
   * Если пользователь уже залогинен И не передан reportUuid -> вернуть список его репортов.
   * Иначе: findOrCreate(email) -> сгенерировать контент ИИ -> сохранить в репорт -> вернуть user + report.
   */
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    // 1) Если передан userId и НЕ просит новый reportUuid -> вернуть список его репортов
    if (dto.userId && !dto.reportUuid) {
      const user = await this.usersService.findById(dto.userId);
      if (!user) throw new BadRequestException("User not found");

      const reports = await this.usersService.getReportsSummary(dto.userId);
      return {
        ok: true,
        user: { id: user.id, email: user.email },
        reports,
      };
    }

    // 2) Создание нового репорта
    if (!dto.reportUuid) {
      throw new BadRequestException(
          "reportUuid is required to create a new report",
      );
    }
    if (!dto.name || !dto.date_of_birth || !dto.country || !dto.email) {
      throw new BadRequestException(
          "email, name, date_of_birth and country are required",
      );
    }

    const user = await this.usersService.findOrCreate(dto.email);

    const report = await this.carmaService.generateAndAttach({
      userId: user.id,
      reportUuid: dto.reportUuid,
      name: dto.name,
      date_of_birth: dto.date_of_birth,
      country: dto.country,
    });

    return {
      ok: true,
      user: { id: user.id, email: user.email },
      report: {
        id: report.id,
        reportUuid: report.reportUuid,
        paid: report.paid,
        created_at: report.created_at,
        result: report.result,
      },
    };
  }

  @Get("me/:userId")
  async meById(@Param("userId") userId: string) {
    if (!userId) {
      throw new UnauthorizedException("Not authenticated");
    }

    const { user, reports } = await this.usersService.getMe(userId);
    return { ok: true, user, reports };
  }

  @Post("login")
  async login(@Body("email") email: string) {
    if (!email) {
      throw new UnauthorizedException("Email is required");
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const reports = await this.usersService.getReportsSummary(user.id);

    // 👉 можно здесь сразу добавить генерацию токена (JWT), если нужно
    return {
      ok: true,
      user: { id: user.id, email: user.email },
      reports,
    };
  }
}
