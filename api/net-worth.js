/**
 * @file 
 */

const express = require('express');
const router = express.Router();
const util = require('./util');
const netWorthModel = require('../model/net-worth-model');

router.get('/networth/:userId/', (req, res) => {
  userId = req.params.userId;
  util.logWithDate(`GET networth - userId: ${userId}`);

  let model = netWorthModel.getInitialModel();
  model = netWorthModel.computeOutputModel(model);

  return res.status(200).send(model);
});

router.post('/networth/:userId/', (req, res) => {
  userId = req.params.userId;
  util.logWithDate(`POST networth - userId: ${userId}`);
  util.logWithDate(`request body: ${req.body}`);

  const body = req.body;

  if (!body || body.length === 0) {
    util.logWithDate(`missing POST body`);
    return res.sendStatus(500);
  }

  //TODO: validate input!

  output = netWorthModel.computeOutputModel(body);
  return res.status(200).send(output);
});

module.exports = router;
