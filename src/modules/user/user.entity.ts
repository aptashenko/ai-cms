// src/users/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { CarmaResult } from "../carma/carma-result.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => CarmaResult, (r) => r.user)
  reports?: CarmaResult[];

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email) this.email = this.email.toLowerCase().trim();
  }
}
