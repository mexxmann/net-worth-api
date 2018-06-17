/**
 * @file 
 */

const express = require('express');
const router = express.Router();
const util = require('./util');

router.get('/networth/:userId/', (req, res) => {
  userId = req.params.userId;
  util.logWithDate(`userId: ${userId}`);

  const result = `{result: 'true'}`;
  return res.status(200).send(result);
});

module.exports = router;
