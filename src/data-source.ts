import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { OTP } from "./entity/OTP";

const databaseConfig = require(process.env.CONFIG_PATH).database;

const baseOptions = {
  synchronize: true,
  logging: false,
  entities: [User, OTP],
};

let connOptions = Object.assign(databaseConfig, baseOptions);

export const AppDataSource = new DataSource(connOptions);
