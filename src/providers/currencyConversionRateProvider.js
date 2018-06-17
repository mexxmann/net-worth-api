const request = require('request-promise');

module.exports = function currencyConversionRateProvider(currencyFrom, currencyTo) {
  const uri = `http://currencyrate.getsandbox.com/currencyRate/${currencyFrom}/${currencyTo}`;
  return request({
    uri,
    method: 'GET',
    json: true,
    timeout: 2000,
  }).then((result) => {
    if (!result || !result.data || !result.data.rate) {
      throw new Error('Malformed response from currency API');
    }
    return result.data.rate;
  });
};
