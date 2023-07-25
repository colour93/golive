import * as argon2 from "argon2";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  nickname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  verified: number;

  @Column({ type: "blob", nullable: true })
  avatar?: Buffer;

  @Column({ nullable: true })
  avatarExt?: 'png' | 'jpeg' | 'webp';

  @Column({ nullable: true })
  key?: string;

  @CreateDateColumn({ default: () => "CURRENT_TIMESTAMP" })
  created: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }
}

export class UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatarUrl?: string;
  verified: number;
}

export class UserProfile extends UserInfo {
  streamServer: string;
  streamKey: string;
  liveroom: string;
}
