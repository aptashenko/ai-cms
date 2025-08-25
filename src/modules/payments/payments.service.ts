import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Payment } from "./payments.entity";
import { CarmaResult } from "../carma/carma-result.entity";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(CarmaResult)
    private readonly carmaRepo: Repository<CarmaResult>,
  ) {}

  async handleGumroadWebhook(payload: any) {
    this.logger.log("Webhook payload:", JSON.stringify(payload, null, 2));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { order_id, product_id, email, price, currency, custom_fields } =
      payload;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const sessionId = custom_fields?.sessionId;
    if (!sessionId) {
      throw new BadRequestException("Missing sessionId in custom_fields");
    }

    // находим пользователя по sessionId (userId в нашей системе)
    const carmaResult = await this.carmaRepo.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { userId: sessionId },
    });
    if (!carmaResult) {
      throw new BadRequestException(
        `No CarmaResult found for sessionId=${sessionId}`,
      );
    }

    // проверка, что уже не было оплаты
    const existing = await this.paymentRepo.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { userId: sessionId },
    });
    if (existing) {
      throw new BadRequestException(
        `Payment already exists for userId=${sessionId}`,
      );
    }

    // создаём оплату
    const payment = this.paymentRepo.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      orderId: order_id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      productId: product_id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      email,
      amount: price / 100,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      currency,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      userId: sessionId,
      carmaResult,
    });

    await this.paymentRepo.save(payment);

    carmaResult.paid = true;
    await this.carmaRepo.save(carmaResult);

    return { success: true };
  }
}
