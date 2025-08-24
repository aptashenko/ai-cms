// carma-result.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Payment } from "../payments/payments.entity";

@Entity("karmic_results")
export class CarmaResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid" })
  userId: string; // уникальный идентификатор пользователя

  @Column({ type: "jsonb" })
  result: Record<string, any>;

  @Column({ type: "boolean", default: false })
  paid: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Payment, (payment) => payment.carmaResult)
  payments: Payment[];
}
