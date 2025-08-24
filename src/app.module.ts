import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { CarmaModule } from "./modules/carma/carma.module";
import { PaymentsModule } from "./modules/payments/payments.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: "postgres",
        url: process.env.DATABASE_URL, // ✅ Fly.io передаст строку подключения
        autoLoadEntities: true,
        synchronize: true, // ⚠️ в проде лучше миграции
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    CarmaModule,
    PaymentsModule,
  ],
})
export class AppModule {}
