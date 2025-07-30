import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "../../@domain/entities/user.entity.js";

config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: process.env.NODE_ENV !== "production",
  synchronize: false,
  entities: [User],
  migrations: ["src/@infrastructure/database/migrations/**/*.ts"],
});
