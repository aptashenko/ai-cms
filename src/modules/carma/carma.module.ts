import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarmaService } from "./carma.service";
import { CarmaResult } from "./carma-result.entity";
import { OpenaiModule } from "../openai/openai.module";
import { CarmaController } from "./carma.controller";

@Module({
  imports: [TypeOrmModule.forFeature([CarmaResult]), OpenaiModule],
  providers: [CarmaService],
  controllers: [CarmaController],
  exports: [CarmaService],
})
export class CarmaModule {}
