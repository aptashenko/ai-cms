import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarmaService } from "./carma.service";
import { CarmaResult } from "./carma-result.entity";
import { OpenaiModule } from "../openai/openai.module";
import { CarmaController } from "./carma.controller";
import { User } from "../user/user.entity";
import { UsersService } from "../user/user.service";

@Module({
  imports: [TypeOrmModule.forFeature([CarmaResult, User]), OpenaiModule],
  providers: [CarmaService, UsersService],
  controllers: [CarmaController],
  exports: [CarmaService],
})
export class CarmaModule {}
