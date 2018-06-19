/**
 * My API Sandbox
 *
 */

function getRateTable() {
  // Rates taken from https://www.x-rates.com/historical/?from=EUR&amount=1&date=2018-06-16
  var rateTable = {
      USD_CAD: 1.320236,
      CAD_USD: 0.7574403364247,
      USD_EUR: 0.861585,
      EUR_USD: 1.16065158980252,
      USD_GBP: 0.753444,
      GBP_USD: 1.32723865343675,
      USD_INR: 68.193694,
      INR_USD: 0.0146641124911051,

      CAD_EUR: 0.652599,
      EUR_CAD: 1.53233455766864,
      CAD_GBP: 0.570688,
      GBP_CAD: 1.75227094314231,
      CAD_INR: 51.652637,
      INR_CAD: 0.0193600957875587,

      EUR_GBP: 0.874485,
      GBP_EUR: 1.1435301920559,
      EUR_INR: 79.149117,
      INR_EUR: 0.0126343797366684,

      GBP_INR: 90.509361,
      INR_GBP: 0.0110485809307614,
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
