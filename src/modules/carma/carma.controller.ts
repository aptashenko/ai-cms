// src/carma/carma.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
} from "@nestjs/common";
import { CarmaService } from "./carma.service";
import { IsString, IsUUID } from "class-validator";
import { UsersService } from "../user/user.service";

class CreateReportDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  reportUuid!: string;

  @IsString()
  name!: string;

  @IsString()
  date_of_birth!: string;

  @IsString()
  country!: string;
}

@Controller("carma")
export class CarmaController {
  constructor(
    private readonly carmaService: CarmaService,
    private readonly usersService: UsersService,
  ) {}

  /** Создать или получить репорт (идемпотентно по reportUuid) */
  @Post("report")
  async createOrGet(@Body() dto: CreateReportDto) {
    return this.carmaService.createOrGetReport(dto);
  }

  /** Получить репорт по reportUuid */
  @Get("report/:id")
  async findByReportUuid(@Param("id") reportUuid: string) {
    if (!reportUuid) {
      throw new BadRequestException("reportUuid is required");
    }
    return this.carmaService.findByReportUuid(reportUuid);
  }

  /** Получить список репортов пользователя */
  @Get("reports/:userId")
  async getUserReports(@Param("userId") userId: string) {
    if (!userId) {
      throw new BadRequestException("userId is required");
    }
    return this.usersService.getReportsSummary(userId);
  }
}
