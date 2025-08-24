// payments.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { CarmaResult } from "../carma/carma-result.entity";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  support_id?: string;

  @Column()
  payer_name: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  message?: string;

  @Column({ unique: true })
  userId: string;

  @ManyToOne(() => CarmaResult, (result) => result.payments, {
    onDelete: "CASCADE",
  })
  carmaResult: CarmaResult;

  @CreateDateColumn()
  createdAt: Date;
}
