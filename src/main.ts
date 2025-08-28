import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as session from "express-session";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Теперь работает
    app.set("trust proxy", 1);

    app.enableCors({
        origin: [
            "http://localhost:5173",
            "https://ai-carma.vercel.app",
        ],
        credentials: true,
    });

    app.use(
        session({
            secret: process.env.SESSION_SECRET || "super_secret_key",
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "none",
                maxAge: 1000 * 60 * 60 * 24 * 7,
            },
        }),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const port = process.env.PORT || 3000;
    await app.listen(port, "0.0.0.0");
}
bootstrap();
