/**
 * My API Sandbox
 *
 */

function getRateTable() {
  // Rates taken from https://www.x-rates.com/historical/?from=EUR&amount=1&date=2018-06-16
  var rateTable = {
      USD_CAD: 1.320236,
      CAD_USD: 0.757440,
      USD_EUR: 0.861585,
      EUR_USD: 1.160652,
      CAD_EUR: 0.652599,
      EUR_CAD: 1.532334,
  };
  return rateTable;
}

Sandbox.define('/currencyRate/{currencyFrom}/{currencyTo}','GET', function(req, res) {
  var currencyFrom, currencyTo, rateKey, errMsg;
  var rateTable = getRateTable();

  // Set the type of response, sets the content type.
  res.type('application/json');

  currencyFrom = req.params.currencyFrom;
  console.log('From Currency: ', currencyFrom);
  currencyTo = req.params.currencyTo;
  console.log('To Currency: ', currencyTo);

  if (!currencyFrom || !currencyTo) {
      errMsg = 'Missing currencyFrom or currencyTo parameter';
      console.log(errMsg);
      return res.status(200).send({
          errors: errMsg,
      });
  }

  rateKey = currencyFrom + '_' + currencyTo;
  if (! rateTable.hasOwnProperty(rateKey)) {
      errMsg = 'Currency rate pair not supported';
      console.log(errMsg);
      return res.status(400).send({
          errors: errMsg,
      });
  }

  // Set the status code of the response.
  res.status(200);

  // Send the response body.
  return res.status(200).send({
      "data": {
          "rate": rateTable[rateKey],
      }
  });
})
