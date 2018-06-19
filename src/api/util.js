const Big = require('big.js');

/**
 * Does a console.log with prefixed the current date
 * @param {string} message - the message to log
 */
function logWithDate(message) {
  console.log(`${new Date()}: ${message}`);
}

/**
 * Will convert a valid number or string representation of a number to a Big.js object
 * @param {*} input Value to convert
 */
function convertToBig(input) {
  if(!Number.isNaN(parseFloat(input)) && Number.isFinite(input)) {
    return Big(input);
  }

  return input;
}

module.exports = {
  logWithDate,
  convertToBig,
};
