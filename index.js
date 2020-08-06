import express from 'express';
import accountsRouter from './routes/accounts.js';
import { promises } from 'fs';

const { readFile, writeFile } = promises;

const app = express();
app.use(express.json());

app.use('/account', accountsRouter);

app.listen(3000, async () => {
  try {
    await readFile('accounts.json');

    console.log('Back-end started!');
  } catch (err) {
    const initialJson = {
      nextId: 1,
      accounts: [],
    };

    await writeFile('accounts.json', JSON.stringify(initialJson));

    console.log('File created and back-end started!');
  }
});
