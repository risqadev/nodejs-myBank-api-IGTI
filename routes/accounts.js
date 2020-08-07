import express from 'express';
import { promises } from 'fs';

const { readFile, writeFile } = promises;
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    let { name, balance } = req.body;
    name = String(name).trim();
    balance = Number(balance);

    const data = JSON.parse(await readFile(global.fileName));

    const account = { id: data.nextId++, name, balance };

    data.accounts.push(account);

    try {
      await writeFile(global.fileName, JSON.stringify(data, null, 2));
    } catch (err) {
      console.log(`File not saved.\nerror: ${err.message}`);

      return res.status(500).send({ error: err.message });
    }

    return res.send(account);
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

router.get('/', async (_req, res) => {
  try {
    const { accounts } = JSON.parse(await readFile(global.fileName));
    return res.send(accounts);
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { accounts } = JSON.parse(await readFile(global.fileName));

    const account = accounts.find((account) => account.id.toString() === id);

    if (!account) {
      return res.status(400).send({ error: 'ID not found.' });
    }

    return res.send(account);
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(await readFile(global.fileName));

    const accountIndex = data.accounts.findIndex(
      (account) => account.id.toString() === id
    );

    if (accountIndex < 0) {
      return res.status(400).send({ error: 'ID not found.' });
    }

    data.accounts.splice(accountIndex, 1);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    return res.status(204).end();
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { id, name, balance } = req.body;

    const data = JSON.parse(await readFile(global.fileName));

    const accountIndex = data.accounts.findIndex(
      (account) => account.id.toString() === id.toString()
    );

    if (accountIndex < 0) {
      return res.status(400).send({ error: 'ID not found.' });
    }

    data.accounts[accountIndex] = { id, name, balance };

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    return res.send(data.accounts[accountIndex]);
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

router.patch('/updateBalance', async (req, res) => {
  try {
    const { id, balance } = req.body;

    const data = JSON.parse(await readFile(global.fileName));

    const accountIndex = data.accounts.findIndex(
      (account) => account.id.toString() === id.toString()
    );

    if (accountIndex < 0) {
      return res.status(400).send({ error: 'ID not found.' });
    }

    data.accounts[accountIndex].balance = balance;

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    return res.send(data.accounts[accountIndex]);
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

export default router;
