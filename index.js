http = require('http');

const express = require('express');
const app = express();

// Main API routes.
app.use('/api', require('./api/net-worth'));

http.createServer(app).listen(3001, () => {
  console.log('Express server listening on port 3001');
});

module.exports = app;
