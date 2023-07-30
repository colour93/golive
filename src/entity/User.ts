import * as argon2 from "argon2";
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";

const databaseConfig = require(process.env.CONFIG_PATH).database;

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

  @Column({
    type: databaseConfig.type === "sqlite" ? "blob" : "longblob",
    nullable: true,
  })
  avatar?: Buffer;

  @Column({ nullable: true })
  avatarExt?: "png" | "jpeg" | "webp";

  @Column({ nullable: true })
  key?: string;

  @Column({ type: "datetime", precision: 6 })
  created: Date;

  @BeforeInsert()
  async preProcess() {
    this.created = new Date();
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


export class UserLiveInfo {
  user: UserInfo;
  stream: {
    flv: string;
    hls: string;
  } | null;
  ws: {
    chat: string;
  } | null;
}