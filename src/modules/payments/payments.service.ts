// src/payments/payments.service.ts
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CarmaResult } from "../carma/carma-result.entity";
import { Payment } from "./payments.entity";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(CarmaResult)
    private readonly resultsRepo: Repository<CarmaResult>,
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<Payment>,
  ) {}

  async handleGumroadWebhook(
    body: {
      url_params?: { uuid?: string } | null;
      email?: string | null;
      price?: string | number | null;
      currency?: string | null;
      order_id?: string | null;
      product_id?: string | null;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _headers: Record<string, string>,
  ) {
    const reportUuid = body?.url_params?.uuid;
    if (!reportUuid) throw new BadRequestException("Missing url_params.uuid");

    const report = await this.resultsRepo.findOne({ where: { reportUuid } });
    if (!report) throw new BadRequestException("Report not found");

    // помечаем репорт оплаченным
    if (!report.paid) {
      report.paid = true;
      await this.resultsRepo.save(report);
    }

    // создаём/обновляем запись платежа (идемпотентность по паре userId+carmaResultId)
    const amount =
      typeof body.price === "string"
        ? Number(body.price)
        : typeof body.price === "number"
          ? body.price
          : null;

    // upsert по userId+carmaResultId
    const existing = await this.paymentsRepo.findOne({
      where: { userId: report.userId, carmaResultId: report.id },
    });

    if (existing) {
      existing.orderId = body.order_id ?? existing.orderId;
      existing.productId = body.product_id ?? existing.productId;
      existing.email = body.email ?? existing.email;
      existing.amount = amount ?? existing.amount;
      existing.currency = body.currency ?? existing.currency;
      await this.paymentsRepo.save(existing);
    } else {
      await this.paymentsRepo.save(
        this.paymentsRepo.create({
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          userId: report.userId,
          carmaResultId: report.id,
          carmaResult: report,
          orderId: body.order_id ?? null,
          productId: body.product_id ?? null,
          email: body.email ?? null,
          amount,
          currency: body.currency ?? null,
        }),
      );
    }
  }
}
