import express from 'express';
import { promises } from 'fs';

const { readFile, writeFile } = promises;
const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let { name, balance } = req.body;
    name = String(name).trim();
    balance = Number(balance);

    if (!name || name === 'undefined' || (!balance && balance !== 0)) {
      throw new Error(`The 'name' and 'balance' values are required.`);
    }

    const data = JSON.parse(await readFile(global.fileName));

    const account = { id: data.nextId++, name, balance };

    data.accounts.push(account);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    logger.info(
      `${req.method} ${req.baseUrl}: created account with id ${account.id}`
    );

    return res.send(account);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { accounts } = JSON.parse(await readFile(global.fileName));

    logger.info(`${req.method} ${req.baseUrl} success.`);

    return res.send(accounts);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    let { id } = req.params;
    id = Number(id);

    if (id < 1) {
      throw new Error(`The 'id' value is not valid.`);
    }

    const { accounts } = JSON.parse(await readFile(global.fileName));

    const account = accounts.find((account) => account.id === id);

    if (!account) {
      throw new Error('ID not found.');
    }

    logger.info(`${req.method} ${req.baseUrl}${req.url} success.`);

    return res.send(account);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    let { id } = req.params;
    id = Number(id);

    if (id < 1) {
      throw new Error(`The 'id' value is not valid.`);
    }

    const data = JSON.parse(await readFile(global.fileName));

    const accountIndex = data.accounts.findIndex(
      (account) => account.id === id
    );

    if (accountIndex < 0) {
      throw new Error('ID not found.');
    }

    data.accounts.splice(accountIndex, 1);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    logger.info(`${req.method} ${req.baseUrl}${req.url} success.`);

    return res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    let { id, name, balance } = req.body;
    id = Number(id);
    name = String(name).trim();
    balance = Number(balance);

    if (id < 1 || !id) {
      throw new Error(`The 'id' value is not valid.`);
    }
    if (!name || name === 'undefined' || (!balance && balance !== 0)) {
      throw new Error(`The 'name' and 'balance' values are required.`);
    }

    const data = JSON.parse(await readFile(global.fileName));

    const accountIndex = data.accounts.findIndex(
      (account) => account.id === id
    );

    if (accountIndex < 0) {
      throw new Error('ID not found.');
    }

    data.accounts[accountIndex] = { id, name, balance };

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    logger.info(`${req.method} ${req.baseUrl}${req.url} ID ${id} updated.`);

    return res.send(data.accounts[accountIndex]);
  } catch (err) {
    next(err);
  }
});

router.patch('/updateBalance', async (req, res, next) => {
  try {
    let { id, balance } = req.body;
    id = Number(id);
    balance = Number(balance);

    if (id < 1 || !id) {
      throw new Error(`The 'id' value is not valid.`);
    }
    if (!balance && balance !== 0) {
      throw new Error(`The 'balance' value is required.`);
    }

    const data = JSON.parse(await readFile(global.fileName));

    const accountIndex = data.accounts.findIndex(
      (account) => account.id === id
    );

    if (accountIndex < 0) {
      throw new Error('ID not found.');
    }

    data.accounts[accountIndex].balance = balance;

    await writeFile(global.fileName, JSON.stringify(data, null, 2));

    logger.info(`${req.method} ${req.baseUrl}${req.url} ID ${id} updated.`);

    return res.send(data.accounts[accountIndex]);
  } catch (err) {
    next(err);
  }
});

// errors
router.use((err, req, res, _next) => {
  logger.error(`${req.method} ${req.baseUrl}${req.url}: ${err.message}`);

  const serverErrNos = [-2, -13];

  if (serverErrNos.some((item) => item === err.errno)) {
    return res.status(500).send({ error: err.message });
  }
  return res.status(400).send({ error: err.message });
});

export default router;
