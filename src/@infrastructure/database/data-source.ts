import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "../../@domain/entities/user.entity.js";
import { Either, left, right } from "../../shared/errors/either.js";
import { MissingEnvVarError } from "../../shared/errors/config.errors.js";

config();

function getDbConfig(): Either<MissingEnvVarError, DataSourceOptions> {
  const required = [
    "DB_HOST",
    "DB_PORT",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_NAME",
  ];

  for (const key of required) {
    if (!process.env[key]) return left(new MissingEnvVarError(key));
  }

  return right({
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
}

const dbConfigResult = getDbConfig();

if (dbConfigResult.isLeft()) {
  throw dbConfigResult.value;
}

export const AppDataSource = new DataSource(dbConfigResult.value);
