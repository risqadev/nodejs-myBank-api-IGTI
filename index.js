import express from 'express';
import { promises } from 'fs';
import winston from 'winston';
import cors from 'cors';

import accountsRouter from './routes/accounts.js';

const { readFile, writeFile } = promises;

global.fileName = 'accounts.json';

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(
  ({ level, message, label, timestamp }) =>
    `${timestamp} [${label}] ${level}: ${message}`
);
global.logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'myBank-api.log' }),
  ],
  format: combine(label({ label: 'myBank-api' }), timestamp(), myFormat),
});

const app = express();
app.use(express.json());
app.use(cors());

app.use('/account', accountsRouter);

app.listen(3000, async () => {
  try {
    await readFile(global.fileName);
    logger.info(`'accounts.json' file loaded.`);
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };

    try {
      await writeFile(global.fileName, JSON.stringify(initialJson));
    } catch (err) {
      logger.error(err);
      return;
    }

    logger.info(`'accounts.json' file created.`);
  }

  logger.info('API started!');
});
