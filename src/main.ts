// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as session from "express-session";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 1. Если запускаем за прокси (Fly.io, Vercel, Heroku и т.д.)
    app.set("trust proxy", 1);

    // 2. Включаем CORS для фронта
    app.enableCors({
        origin: [
            "http://localhost:5173",
            "https://ai-carma.vercel.app",
        ],
        credentials: true,
    });

    // 3. Сессии
    app.use(
        session({
            secret: process.env.SESSION_SECRET || "super_secret_key", // см. ниже
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // только по https в проде
                sameSite: "none", // иначе браузер выкинет куку при запросе с фронта
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 дней
            },
        }),
    );

    // 4. Валидация
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // 5. Запуск
    const port = process.env.PORT || 3000;
    await app.listen(port, "0.0.0.0");
}
bootstrap();
