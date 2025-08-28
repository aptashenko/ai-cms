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
  async register(@Body() dto: RegisterDto, @Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const sessionUserId: string | undefined = req?.session?.userId;

    // 1) Уже залогинен и НЕ просит новый репорт -> вернуть список имеющихся
    if (sessionUserId && !dto.reportUuid) {
      const user = await this.usersService.findById(sessionUserId);
      const reports = await this.usersService.getReportsSummary(sessionUserId);
      return {
        ok: true,
        user: { id: user.id, email: user.email },
        reports, // [{ id, reportUuid, paid, created_at }, ...]
      };
    }

    // 2) Обычная регистрация/логин + создание репорта
    if (!dto.reportUuid) {
      throw new BadRequestException(
        "reportUuid is required to create a new report",
      );
    }
    if (!dto.name || !dto.date_of_birth || !dto.country) {
      throw new BadRequestException(
        "name, date_of_birth and country are required to create a report",
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

    // авторизуем сессией
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req?.session) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.session.userId = user.id;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.session.email = user.email;
    }

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
  async login(@Body("email") email: string, @Req() req: any) {
    if (!email) {
      throw new UnauthorizedException("Email is required");
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // сохраняем userId в сессии
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req?.session) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.session.userId = user.id;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      req.session.email = user.email;
    }

    const reports = await this.usersService.getReportsSummary(user.id);

    return {
      ok: true,
      user: { id: user.id, email: user.email },
      reports,
    };
  }
}
