// src/users/dto/registration.dto.ts
import { IsEmail, IsOptional, IsString, IsUUID } from "class-validator";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsUUID()
  reportUuid?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() date_of_birth?: string;
  @IsOptional() @IsString() country?: string;
}
