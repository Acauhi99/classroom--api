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

  const isTestEnv = process.env.NODE_ENV === "test";
  const databaseName = isTestEnv
    ? process.env.DB_TEST_NAME || `${process.env.DB_NAME}_test`
    : process.env.DB_NAME;

  return right({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT as string),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: databaseName,
    logging: false,
    synchronize: isTestEnv,
    dropSchema: isTestEnv,
    entities: [User],
    migrations: isTestEnv
      ? []
      : ["src/@infrastructure/database/migrations/**/*.ts"],
    extra: {
      max: 5,
      min: 1,
      idleTimeoutMillis: 10000,
    },
  });
}

const dbConfigResult = getDbConfig();

if (dbConfigResult.isLeft()) {
  throw dbConfigResult.value;
}

export const AppDataSource = new DataSource(dbConfigResult.value);
