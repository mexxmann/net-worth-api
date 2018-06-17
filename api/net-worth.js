/**
 * @file 
 */

const express = require('express');
const router = express.Router();
const util = require('./util');
const netWorthModel = require('../model/net-worth-model');
const currencyConversionRateProvider = require('../providers/currencyConversionRateProvider');

router.get('/networth/:userId/', (req, res) => {
  userId = req.params.userId;
  util.logWithDate(`GET networth - userId: ${userId}`);

  let model = netWorthModel.getInitialModel();
  netWorthModel.computeOutputModel(model).then(outputModel => {
    return res.status(200).send(outputModel);
  }).catch(err => {
    return res.status(500).send({
      errors: `Failed to compute new output model: ${err.toString()}`
    });
  });
});

router.post('/networth/:userId/', (req, res) => {
  const userId = req.params.userId;
  const currencyTo = req.query.currencyTo;
  util.logWithDate(`POST networth - userId: ${userId}, currencyTo: ${currencyTo}`);

  const body = req.body;

  if (!body || body.length === 0) {
    util.logWithDate(`missing POST body`);
    return res.sendStatus(500);
  }

  //TODO: validate input!

  netWorthModel.computeOutputModel(body, currencyTo, currencyConversionRateProvider).then(outputModel => {
    return res.status(200).send(outputModel);
  }).catch(err => {
    return res.status(500).send({
      errors: `Failed to compute new output model: ${err.toString()}`
    });
  });
});

module.exports = router;
