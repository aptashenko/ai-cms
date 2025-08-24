// payments.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Payment } from "./payments.entity";
import { CarmaResult } from "../carma/carma-result.entity";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,

    @InjectRepository(CarmaResult)
    private readonly carmaRepo: Repository<CarmaResult>,
  ) {}

  async savePayment(payload: any) {
    const payment = this.paymentRepo.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      support_id: payload.supporter_id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      payer_name: payload.supporter_name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      amount: payload.total_amount_charged,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      message: payload.support_note || null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      userId: payload.userId || null,
    });

    const saved = await this.paymentRepo.save(payment);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (payload.userId) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      await this.carmaRepo.update({ userId: payload.userId }, { paid: true });
    }

    return saved;
  }

  async findBySupportId(supportId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { support_id: supportId },
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment with support_id "${supportId}" not found`,
      );
    }

    return payment;
  }
}
