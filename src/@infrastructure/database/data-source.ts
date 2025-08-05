import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "../../@domain/entities/user.entity.js";
import { Either, left, right } from "../../shared/errors/either.js";
import { MissingEnvVarError } from "../../shared/errors/config.errors.js";

config();

interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

function validateRequiredEnvVars(): Either<MissingEnvVarError, DatabaseConfig> {
  const required = [
    "DB_HOST",
    "DB_PORT",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_NAME",
  ];

  for (const key of required) {
    if (!process.env[key]) {
      return left(new MissingEnvVarError(key));
    }
  }

  const port = parseInt(process.env.DB_PORT!);
  if (isNaN(port)) {
    return left(new MissingEnvVarError("DB_PORT (must be a valid number)"));
  }

  const isTestEnv = process.env.NODE_ENV === "test";
  const database = isTestEnv
    ? process.env.DB_TEST_NAME || `${process.env.DB_NAME}_test`
    : process.env.DB_NAME!;

  return right({
    host: process.env.DB_HOST!,
    port,
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database,
  });
}

function createConnectionPoolConfig() {
  const isTestEnv = process.env.NODE_ENV === "test";

  return {
    max: isTestEnv ? 3 : 10,
    min: isTestEnv ? 1 : 2,
    idleTimeoutMillis: isTestEnv ? 5000 : 30000,
    acquireTimeoutMillis: 10000,
    evictionRunIntervalMillis: 10000,
  };
}

function createDataSourceOptions(dbConfig: DatabaseConfig): DataSourceOptions {
  const isTestEnv = process.env.NODE_ENV === "test";

  return {
    type: "postgres",
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,

    logging: false,
    synchronize: isTestEnv,
    dropSchema: isTestEnv,

    entities: [User],
    migrations: isTestEnv
      ? []
      : ["src/@infrastructure/database/migrations/**/*.ts"],

    extra: createConnectionPoolConfig(),
    connectTimeoutMS: 10000,
    maxQueryExecutionTime: 5000,
  };
}

function createDataSource(): Either<MissingEnvVarError, DataSource> {
  const dbConfigResult = validateRequiredEnvVars();

  if (dbConfigResult.isLeft()) {
    return left(dbConfigResult.value);
  }

  const options = createDataSourceOptions(dbConfigResult.value);
  const dataSource = new DataSource(options);

  return right(dataSource);
}

const dataSourceResult = createDataSource();

if (dataSourceResult.isLeft()) {
  throw dataSourceResult.value;
}

export const AppDataSource = dataSourceResult.value;

export const DatabaseUtils = {
  isTestEnvironment(): boolean {
    return process.env.NODE_ENV === "test";
  },

  getPoolConfig() {
    return createConnectionPoolConfig();
  },

  createTestDataSource(): Either<MissingEnvVarError, DataSource> {
    return createDataSource();
  },
};
