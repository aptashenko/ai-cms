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
    private readonly carmaRepo: Repository<CarmaResult>, // 👈 добавили репозиторий
  ) {}

  async savePayment(payload: any) {
    // создаём запись о платеже
    const payment = this.paymentRepo.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      support_id: payload.support_id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      payer_name: payload.payer_name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      amount: payload.amount,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      message: payload.message,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      userId: payload.userId,
    });

    const saved = await this.paymentRepo.save(payment);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    await this.carmaRepo.update({ userId: payload.userId }, { paid: true });

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
