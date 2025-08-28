// src/carma/carma-result.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Payment } from "../payments/payments.entity";
import { User } from "../user/user.entity";

@Entity("karmic_results")
export class CarmaResult {
  @PrimaryGeneratedColumn()
  id: number;

  // Владелец
  @Index()
  @Column({ type: 'uuid', default: () => 'uuid_generate_v4()' }) // ← ВАЖНО: default
  userId: string;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user?: User; // опционально в TS

  // Уникальный UUID репорта: нужен для роутинга и вебхука
  @Index({ unique: true })
  @Column({ type: "uuid" })
  reportUuid: string;

  // Контент репорта
  @Column({ type: "jsonb" })
  result: Record<string, any>;

  // Оплачен ли репорт
  @Column({ type: "boolean", default: false })
  paid: boolean;

  // Дата создания
  @Index()
  @CreateDateColumn()
  created_at: Date;

  // Платежи по этому репорту
  @OneToMany(() => Payment, (payment) => payment.carmaResult)
  payments?: Payment[];
}
