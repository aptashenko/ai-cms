// src/app.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CarmaModule } from "./modules/carma/carma.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import {UsersModule} from "./modules/user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const isProd = cfg.get("NODE_ENV") === "production";

        if (isProd) {
          return {
            type: "postgres",
            url: cfg.get<string>("DATABASE_URL"),
            autoLoadEntities: true,
            synchronize: true,
            migrationsRun: true,
            logging: false,
            ssl: { rejectUnauthorized: false },
          };
        }

        // dev: локальная БД
        return {
          type: "postgres",
          host: cfg.get<string>("DB_HOST", "127.0.0.1"),
          port: parseInt(cfg.get<string>("DB_PORT", "5432"), 10),
          username: cfg.get<string>("DB_USER", "a1111"),
          password: cfg.get<string>("DB_PASSWORD", "1111"),
          database: cfg.get<string>("DB_NAME", "carma"),
          autoLoadEntities: true,
          synchronize: true,
          logging: true,
          ssl: false,
        };
      },
    }),

    CarmaModule,
    PaymentsModule,
    UsersModule
  ],
})
export class AppModule {}
