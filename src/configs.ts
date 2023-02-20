import * as env from 'dotenv';
env.config();

class AppConfig {
  constructor(
    public JWT_SECRET = process.env.JWT_SECRET || 'SecrEtToKeN11secret',
    public MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
    public MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'blogApi',
    public PORT = process.env.PORT || 7542,
    public IS_LOCAL_VERSION = process.env.IS_LOCAL_VERSION === 'true',
    public GMAIL_LOGIN = process.env.GMAIL_LOGIN,
    public GMAIL_PASS = process.env.GMAIL_PASS,
    public ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION,
    public REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION,
    public EXTENDED_LOGS = process.env.EXTENDED_LOGS === 'true',
    public DEBOUNCE_TIME = Number(process.env.DEBOUNCE_TIME),
    public EXPIRED_DEVICE_SESSION_DAYS = Number(process.env.EXPIRED_DEVICE_SESSION_DAYS),
  ) {}
}

export const SETTINGS = {
  JWT_SECRET: process.env.JWT_SECRET || 'SecrEtToKeN11fsdagdsf',
  MONGO_URL: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017',
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'blogApi',
  PORT: process.env.PORT || 7542,
  IS_LOCAL_VERSION: process.env.IS_LOCAL_VERSION === 'true',
  GMAIL_LOGIN: process.env.GMAIL_LOGIN,
  GMAIL_PASS: process.env.GMAIL_PASS,
  ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION, // seconds
  REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION, // seconds
  EXTENDED_LOGS: process.env.EXTENDED_LOGS === 'true',
  DEBOUNCE_TIME: Number(process.env.DEBOUNCE_TIME),
  EXPIRED_DEVICE_SESSION_DAYS: Number(process.env.EXPIRED_DEVICE_SESSION_DAYS),
};
