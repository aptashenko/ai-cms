import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from "typeorm";
import { CarmaResult } from "../carma/carma-result.entity";

@Entity("payments")
@Unique(["userId"]) // только одна оплата на userId
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: string; // Gumroad order_id

  @Column()
  productId: string;

  @Column()
  email: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  userId: string; // связываем с нашим пользователем

  @ManyToOne(() => CarmaResult, (result) => result.payments, {
    onDelete: "CASCADE",
  })
  carmaResult: CarmaResult;

  @CreateDateColumn()
  createdAt: Date;
}
