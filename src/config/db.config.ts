const ENVIRONMENT: string = process.env.PROD_ENV ?? "development";

export const appConfig = {
  prod: ENVIRONMENT === "production" ? true : false,
  port: process.env.PORT ?? 3000,
};

export const databaseDetails = {
  DATABASE_NAME:
    ENVIRONMENT === "production" ? "LUCKY_DB_PROD" : "LUCKY_DB_DEV",
  SCHEMA_NAME:
    ENVIRONMENT === "production"
      ? "LUCKY_DB_PROD.BLOCKCHAIN"
      : "LUCKY_DB_DEV.BLOCKCHAIN",
  SPIN_HISTORY: "SPIN_HISTORY",
};
