import express from 'express';
import accountsRouter from './routes/accounts.js';
import { promises } from 'fs';

const { readFile, writeFile } = promises;

global.fileName = 'accounts.json';

const app = express();
app.use(express.json());

app.use('/account', accountsRouter);

app.listen(3000, async () => {
  try {
    await readFile(global.fileName);
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };

    try {
      await writeFile(global.fileName, JSON.stringify(initialJson));
    } catch (err) {
      console.log(`File not saved.\nerror: ${err.message}`);
      return;
    }

    console.log('File created.');
  }

  console.log('Back-end started!');
});
