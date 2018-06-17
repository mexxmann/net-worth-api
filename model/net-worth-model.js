const util = require('../api/util');

function getInitialModel() {
    return {
        assets: {
          'Chequing': {
            interestRate: 0,
            value: 2000,
            category: 'Cash and Investments'
          },
          'Savings for Taxes': {
            interestRate: 5,
            value: 4000,
            category: 'Cash and Investments',
          },
          'Primary Home': {
            interestRate: 1,
            value: 4555000,
            category: 'Long Term Assets',
          },
          'Second Home': {
            interestRate: 2,
            value: 1564321,
            category: 'Long Term Assets',
          }
        },
        liabilities: {
          'Credit Card 1': {
            monthlyPayment: 200,
            interestRate: 50,
            value: 4342,
            category: 'Short Term Liabilities'
          },
          'Credit Card 2': {
            monthlyPayment: 150,
            interestRate: 22,
            value: 322,
            category: 'Short Term Liabilities'
          },
          'Mortgage 1': {
            monthlyPayment: 2000,
            interestRate: 2.6,
            value: 250999,
            category: 'Long Term Debt',
          },
          'Mortgage 2': {
            monthlyPayment: 3500,
            interestRate: 5.4,
            value: 622634,
            category: 'Long Term Debt',
          }
        },
        currency: 'USD',
      };
}

function computeLineItemTotal(balanceSheetData) {
    let total = 0;
    Object.keys(balanceSheetData).forEach(key => {
        total += balanceSheetData[key].value;
    });
    return total;
}

// TODO: Ensure all numbers are doubles
function generateOutputBalanceSheetItems(inputBalanceSheetData, rate) {
    const outputBalanceSheetData = {};
    Object.keys(inputBalanceSheetData).forEach(key => {
        outputBalanceSheetData[key] = Object.assign({}, inputBalanceSheetData[key]);

        // Apply currency conversion if necessary
        if (rate !== 1) {
            outputBalanceSheetData[key].value = outputBalanceSheetData[key].value * rate;
        }
    });
    return outputBalanceSheetData;
}

function _computeOutputModel(inputModel, currencyTo, currencyConversionRate) {
    let outputModel = {};

    outputModel.assets = generateOutputBalanceSheetItems(inputModel.assets, currencyConversionRate);
    outputModel.liabilities = generateOutputBalanceSheetItems(inputModel.liabilities, currencyConversionRate);
    outputModel.currency = currencyTo;

    outputModel.totalAssets = computeLineItemTotal(outputModel.assets);
    outputModel.totalLiabilities = computeLineItemTotal(outputModel.liabilities);
    outputModel.netWorth = outputModel.totalAssets - outputModel.totalLiabilities;
  
    return outputModel;
}

function computeOutputModel(inputModel, currencyTo, currencyConversionRateProvider) {
    let providerPromise = Promise.resolve(1); // Default to a rate of 1 (no conversion)
    if (currencyTo && currencyTo !== inputModel.currency) {
        providerPromise = currencyConversionRateProvider(inputModel.currency, currencyTo);
    }

    return providerPromise.then(currencyConversionRate => {
        return _computeOutputModel(inputModel, currencyTo, currencyConversionRate);
    }).catch(err => {
        util.logWithDate(`Failed to retrieve currency conversion rate from provider: ${err}`);

        // Can't do currency conversion but execute other computation steps
        // Retain the original currency since we couldn't do the conversion.
        return _computeOutputModel(inputModel, inputModel.currency, 1);
    });
}

module.exports = {
    getInitialModel,
    computeOutputModel,
}