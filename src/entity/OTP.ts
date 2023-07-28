import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";

@Entity()
export class OTP {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  code: string;

  @Column({ default: 0 })
  used: number;

  @Column({ type: "datetime", precision: 6 })
  created: Date;

  @BeforeInsert()
  async preProcess() {
    this.created = new Date();
  }
}
