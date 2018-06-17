const express = require('express');
const util = require('./util');
const netWorthModel = require('../model/net-worth-model');
const currencyConversionRateProvider = require('../providers/currencyConversionRateProvider');

const router = express.Router();

/**
 * Returns a Net Worth model for a given user
 */
router.get('/networth/:userId/', (req, res) => {
  const model = netWorthModel.getInitialModel();
  netWorthModel.computeOutputModel(model).then((outputModel) => {
    return res.status(200).send({ data: outputModel });
  }).catch((err) => {
    return res.status(500).send({
      errors: `Failed to compute new output model: ${err.toString()}`,
    });
  });
});

/**
 * Computes a new Net Worth model based on inputs in the payload
 * Note: The eslint suppression is there because there appears to be a problem with that rule for this method
 */
router.post('/networth/:userId/', (req, res) => { // eslint-disable-line consistent-return
  const { currencyTo } = req.query;
  util.logWithDate(`POST networth - currencyTo: ${currencyTo}`);

  const { body } = req;
  if (!body || body.length === 0) {
    return res.status(400).send({ errors: 'Missing POST body' });
  }

  netWorthModel.computeOutputModel(body, currencyTo, currencyConversionRateProvider).then((outputModel) => {
    return res.status(200).send({ data: outputModel });
  }).catch((err) => {
    return res.status(500).send({
      errors: `Failed to compute new output model: ${err.toString()}`,
    });
  });
});

module.exports = router;
