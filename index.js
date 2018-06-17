http = require('http');

const express = require('express');
const util = require('./api/util');

const app = express();
app.use(express.json());

// Content-Type validation
app.use('/api/', (req, res, next) => {
  // If this is a CORS pre-flight check, skip validation
  if (Object.prototype.hasOwnProperty.call(req.headers, 'access-control-request-method')) {
    return next();
  }

  // Our API only accepts JSON payloads for POST methods
  if (!Object.prototype.hasOwnProperty.call(req.headers, 'content-type') || req.method !== 'POST') {
    return next();
  }
  const contype = req.headers['content-type'];
  if (!contype || contype.indexOf('application/json') !== 0) {
    util.logWithDate(`content-type: ${contype} not accepted for path: ${req.url}`);
    return res.sendStatus(400);
  }
  return next();
});

// Disable CORS - don't do this for a real app!
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Main API routes.
app.use('/api', require('./api/net-worth'));

http.createServer(app).listen(3001, () => {
  console.log('Express server listening on port 3001');
});

module.exports = app;
