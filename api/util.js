/**
 * Does a console.log with prefixed the current date
 * @param {string} message - the message to log
 */
function logWithDate(message) {
  console.log(`${new Date()}: ${message}`);
}

module.exports = {
  logWithDate,
};
