/**
 * Does a console.log with prefixed the current date
 * @param {string} message - the message to log
 */
function logWithDate(message) {
  console.log(`${new Date()}: ${message}`);
}

/**
 * Checks if the input is a number
 * @param {*} n Number to check
 * @returns {boolean} Whether the input is a number
 */
function isNumeric(n) {
  return !Number.isNaN(parseFloat(n)) && Number.isFinite(n);
}

module.exports = {
  logWithDate,
  isNumeric,
};
