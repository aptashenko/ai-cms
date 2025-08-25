// payments.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const data = payload.data;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const userId = data.support_note;
    if (!userId) {
      throw new BadRequestException("Missing userId in support_note");
    }

    const existing = await this.paymentRepo.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Payment already exists for userId=${payload.userId}`,
      );
    }

    const payment = this.paymentRepo.create({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      support_id: data.transaction_id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      payer_name: data.supporter_name,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      amount: parseFloat(data.total_amount_charged),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      userId,
    });

    const saved = await this.paymentRepo.save(payment);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    await this.carmaRepo.update({ userId }, { paid: true });

    return saved;
  }
}
