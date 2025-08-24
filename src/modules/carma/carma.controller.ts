import { Controller, Post, Body, Get, Param } from "@nestjs/common";
import { CarmaService } from "./carma.service";

@Controller("carma")
export class CarmaController {
  constructor(private readonly carmaService: CarmaService) {}

  @Post("history")
  async generate(
    @Body()
    dto: {
      uuid: string;
      name: string;
      date_of_birth: string;
      country: string;
    },
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.carmaService.askChat(dto);
  }

  @Get(":uuid")
  async findOne(@Param("uuid") uuid: string) {
    return this.carmaService.findByUuid(uuid);
  }
}
