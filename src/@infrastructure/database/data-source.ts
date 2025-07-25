import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "../../@domain/entities/user.entity.js";

config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "classroom_api",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [User],
  migrations: ["src/database/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});
