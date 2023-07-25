import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { OTP } from "./entity/OTP";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "config/data.db",
  synchronize: true,
  logging: false,
  entities: [User, OTP],
  migrations: [],
  subscribers: [],
});
