// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1) Включаем CORS — без credentials, без явных allowedHeaders
  app.enableCors({
    // можно конкретные домены:
    origin: ["http://localhost:5173", "https://ai-carma.vercel.app"],
    // или временно максимально либерально:
    // origin: (origin, cb) => cb(null, true),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // 2) Явный ответ на OPTIONS (если прокси глотает префлайт)
  app.use((req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (req.method === "OPTIONS") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const reqOrigin = (req.headers.origin as string) || "*";
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      res.header("Access-Control-Allow-Origin", reqOrigin);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      res.header("Vary", "Origin");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      // Эхоим то, что запросил браузер — работает с любыми заголовками
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
      res.header(
        "Access-Control-Allow-Headers",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (req.headers["access-control-request-headers"] as string) ||
          "Content-Type",
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
      return res.sendStatus(204);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000, "0.0.0.0");
}
bootstrap();
