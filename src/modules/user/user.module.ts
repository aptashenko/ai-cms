// src/users/user.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { CarmaResult } from "../carma/carma-result.entity";
import { UsersService } from "./user.service";
import { UserController } from "./user.controller";
import { CarmaModule } from "../carma/carma.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, CarmaResult]), CarmaModule],
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
})
export class UsersModule {}
