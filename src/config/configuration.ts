import * as process from 'process';

export const getConfiguration = () => ({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB: {
    REPOSITORY_TYPE: process.env.REPOSITORY_TYPE, // mongo or pg
    MONGO: {
      MONGO_BASE_URL: process.env.MONGO_BASE_URL,
      MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    },
    PG: {
      PG_HOST: process.env.PG_HOST,
      PG_PORT: process.env.PG_PORT,
      PG_USERNAME: process.env.PG_USERNAME,
      PG_PASSWORD: process.env.PG_PASSWORD,
      PG_DB_NAME: process.env.PG_DB_NAME,
    },
  },
  GMAIL: {
    GMAIL_LOGIN: process.env.GMAIL_LOGIN,
    GMAIL_PASS: process.env.GMAIL_PASS,
  },
  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET,
    ACCESS_TOKEN_EXPIRATION_SEC: process.env.ACCESS_TOKEN_EXPIRATION_SEC, // SEC
    REFRESH_TOKEN_EXPIRATION_SEC: process.env.REFRESH_TOKEN_EXPIRATION_SEC, // SEC
    EXPIRED_DEVICE_SESSION_DAYS: process.env.EXPIRED_DEVICE_SESSION_DAYS, // days
    REQUESTS_TTL_SEC: process.env.REQUESTS_TTL_SEC, // seconds
    REQUESTS_LIMIT: process.env.REQUESTS_LIMIT, // requests quantity per REQUESTS_TTL_SEC
    HTTP_BASIC_USER: process.env.HTTP_BASIC_USER,
    HTTP_BASIC_PASSWORD: process.env.HTTP_BASIC_PASSWORD,
  },
});

export type ConfigurationType = ReturnType<typeof getConfiguration>;
