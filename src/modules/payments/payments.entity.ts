import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Unique,
  Index,
  JoinColumn,
} from "typeorm";
import { CarmaResult } from "../carma/carma-result.entity";

@Entity("payments")
@Unique(["userId", "carmaResultId"]) // по одному платежу на отчёт для конкретного пользователя
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  productId: string;

  @Column({ nullable: true })
  email: string;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      // хранится как строка DECIMAL -> читаем как number
      to: (v: number | null) => v,
      from: (v: string | null) => (v == null ? null : Number(v)),
    },
  })
  amount: number | null;

  @Column({ nullable: true })
  currency: string;

  @Index()
  @Column({ type: "uuid" })
  userId: string; // владелец платежа

  @Index()
  @Column()
  carmaResultId: number; // FK-колонка к отчёту

  @ManyToOne(() => CarmaResult, (result) => result.payments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "carmaResultId" })
  carmaResult: CarmaResult;

  @CreateDateColumn()
  createdAt: Date;
}
