const util = require('../api/util');
const Big = require('big.js');

/**
 * Returns an intialized model.
 * In a real app, would normally read this from a DB.
 * @returns {Object} The model
 */
function getInitialModel() {
  return {
    assets: {
      Chequing: {
        interestRateBig: Big(0),
        valueBig: Big(2000),
        category: 'Cash and Investments',
      },
      'Savings for Taxes': {
        interestRateBig: Big(5),
        valueBig: Big(4000),
        category: 'Cash and Investments',
      },
      'Rainy Day Fund': {
        interestRateBig: Big(0),
        valueBig: Big(506),
        category: 'Cash and Investments',
      },
      'Savings for Fun': {
        interestRateBig: Big(0),
        valueBig: Big(5000),
        category: 'Cash and Investments',
      },
      'Savings for Travel': {
        interestRateBig: Big(0),
        valueBig: Big(400),
        category: 'Cash and Investments',
      },
      'Savings for Personal Development': {
        interestRateBig: Big(1.5),
        valueBig: Big(200),
        category: 'Cash and Investments',
      },
      'Investment 1': {
        interestRateBig: Big(2.3),
        valueBig: Big(5000),
        category: 'Cash and Investments',
      },
      'Investment 2': {
        interestRateBig: Big(2),
        valueBig: Big(60000),
        category: 'Cash and Investments',
      },
      'Investment 3': {
        interestRateBig: Big(5),
        valueBig: Big(30000),
        category: 'Cash and Investments',
      },
      'Investment 4': {
        interestRateBig: Big(10),
        valueBig: Big(50000),
        category: 'Cash and Investments',
      },
      'Investment 5': {
        interestRateBig: Big(0),
        valueBig: Big(24000),
        category: 'Cash and Investments',
      },
      'Primary Home': {
        interestRateBig: Big(1),
        valueBig: Big(4555000),
        category: 'Long Term Assets',
      },
      'Second Home': {
        interestRateBig: Big(2),
        valueBig: Big(1564321),
        category: 'Long Term Assets',
      },
    },
    liabilities: {
      'Credit Card 1': {
        monthlyPaymentBig: Big(200),
        interestRateBig: Big(50),
        valueBig: Big(4342),
        category: 'Short Term Liabilities',
      },
      'Credit Card 2': {
        monthlyPaymentBig: Big(150),
        interestRateBig: Big(22),
        valueBig: Big(322),
        category: 'Short Term Liabilities',
      },
      'Mortgage 1': {
        monthlyPaymentBig: Big(2000),
        interestRateBig: Big(2.6),
        valueBig: Big(250999),
        category: 'Long Term Debt',
      },
      'Mortgage 2': {
        monthlyPaymentBig: Big(3500),
        interestRateBig: Big(5.4),
        valueBig: Big(622634),
        category: 'Long Term Debt',
      },
      'Line of Credit': {
        monthlyPaymentBig: Big(500),
        interestRateBig: Big(5),
        valueBig: Big(10000),
        category: 'Long Term Debt',
      },
      'Investment Loan': {
        monthlyPaymentBig: Big(700),
        interestRateBig: Big(6),
        valueBig: Big(10000),
        category: 'Long Term Debt',
      },
    },
    currency: 'USD',
  };
}

// Helper function used from computeFutureNetWorth
// Note: allYearsBalanceSheet parameter is mutated - would be nice to find a way not to do that!
computeYearlyBalanceForAllAssets = (balanceSheet, year, allYearsBalanceSheet) => {
  let currentYearBalanceForAllAssetsBig = Big(0);
  const currentYearAssetBalanceSheet = {};
  if (balanceSheet && Object.keys(balanceSheet).length > 0) {
    Object.keys(balanceSheet).forEach((key) => {
      let currentYearBalanceForAssetBig = util.convertToBig(balanceSheet[key].valueBig, Big(0));
      if (year > 0) {
        currentYearBalanceForAssetBig = allYearsBalanceSheet[year - 1][key];
      }
      const interestRateBig = util.convertToBig(balanceSheet[key].interestRateBig, Big(0));
      currentYearBalanceForAssetBig = currentYearBalanceForAssetBig.plus(
        currentYearBalanceForAssetBig.times(interestRateBig.div(100)),
      );

      currentYearAssetBalanceSheet[key] = currentYearBalanceForAssetBig;
      currentYearBalanceForAllAssetsBig = currentYearBalanceForAllAssetsBig.plus(currentYearBalanceForAssetBig);
    });
  }
  allYearsBalanceSheet.push(currentYearAssetBalanceSheet);
  return currentYearBalanceForAllAssetsBig;
};

// Helper function used from computeFutureNetWorth
// Note: allYearsBalanceSheet parameter is mutated - would be nice to find a way not to do that!
computeYearlyBalanceForAllLiabilities = (balanceSheet, year, allYearsBalanceSheet) => {
  let currentYearBalanceForAllLiabilitiesBig = Big(0);
  const currentYearLiabilitiesBalanceSheet = {};
  if (balanceSheet && Object.keys(balanceSheet).length > 0) {
    Object.keys(balanceSheet).forEach((key) => {
      let currentYearBalanceForLiabilityBig = util.convertToBig(balanceSheet[key].valueBig, Big(0));
      if (year > 0) {
        currentYearBalanceForLiabilityBig = allYearsBalanceSheet[year - 1][key];
      }

      const interestRateBig = util.convertToBig(balanceSheet[key].interestRateBig, Big(0));
      const monthlyPaymentBig = util.convertToBig(balanceSheet[key].monthlyPaymentBig, Big(0));

      // Original Principal + interest - payments over year
      currentYearBalanceForLiabilityBig =
        currentYearBalanceForLiabilityBig.plus(
          currentYearBalanceForLiabilityBig.times(interestRateBig.div(100)),
        ).minus(monthlyPaymentBig.times(12));

      currentYearLiabilitiesBalanceSheet[key] = currentYearBalanceForLiabilityBig;
      if (currentYearBalanceForLiabilityBig.gt(0)) {
        currentYearBalanceForAllLiabilitiesBig =
          currentYearBalanceForAllLiabilitiesBig.plus(currentYearBalanceForLiabilityBig);
      }
    });
  }
  allYearsBalanceSheet.push(currentYearLiabilitiesBalanceSheet);
  return currentYearBalanceForAllLiabilitiesBig;
};

/**
 * Calculates future Net Worth
 * @param {*} assetBalanceSheet Assets
 * @param {*} liabilitiesBalanceSheet Liabilities
 * @return {Array} Net worth values for next 20 years
 */
function computeFutureNetWorth(assetBalanceSheet, liabilitiesBalanceSheet) {
  const futureNetWorth = [];
  const allYearsAssetBalanceSheet = [];
  const allYearsLiabilitiesBalanceSheet = [];

  for (let year = 0; year < 20; year += 1) {
    const currentYearBalanceForAllAssetsBig = computeYearlyBalanceForAllAssets(
      assetBalanceSheet,
      year,
      allYearsAssetBalanceSheet,
    );

    const currentYearBalanceForAllLiabilitiesBig = computeYearlyBalanceForAllLiabilities(
      liabilitiesBalanceSheet,
      year,
      allYearsLiabilitiesBalanceSheet,
    );

    futureNetWorth.push(currentYearBalanceForAllAssetsBig.minus(currentYearBalanceForAllLiabilitiesBig));
  }

  return futureNetWorth;
}

/**
 * Adds up the values for line-items an a Balance Sheet class - eg adds up all Assets or Liabilities
 * @param {Object} balanceSheetData The line-items to add
 * @returns {Big} The total
 */
function computeLineItemTotal(balanceSheetData) {
  let total = Big(0);
  Object.keys(balanceSheetData).forEach((key) => {
    const a = balanceSheetData[key].valueBig;
    if (a instanceof Big === false && a instanceof String === false && typeof a !== 'string') {
      util.logWithDate(`********* item ${key} was a float!!!!! ->`, a);
    }
    total = total.plus(util.convertToBig(balanceSheetData[key].valueBig, Big(0)));
  });
  return total;
}

/**
 * Copies items from inputBalanceSheetData into an equivalent output structure
 * and applies currency conversion if rate <> 1
 * Avoids mutating the input
 * @param {*} inputBalanceSheetData The input
 * @param {Big} rateBig The conversion rate
 * @returns {Object} The output Balance Sheet items
 */
function initializeOutputBalanceSheetItems(inputBalanceSheetData, rateBig) {
  const outputBalanceSheetData = {};
  Object.keys(inputBalanceSheetData).forEach((key) => {
    outputBalanceSheetData[key] = Object.assign({}, inputBalanceSheetData[key]);

    // Apply currency conversion if necessary
    const localRateBig = util.convertToBig(rateBig, Big(1));
    if (localRateBig.eq(1) === false) {
      outputBalanceSheetData[key].valueBig =
        util.convertToBig(outputBalanceSheetData[key].valueBig, Big(0)).times(localRateBig);
      if (Object.prototype.hasOwnProperty.call(outputBalanceSheetData[key], 'monthlyPaymentBig')) {
        outputBalanceSheetData[key].monthlyPaymentBig =
        util.convertToBig(outputBalanceSheetData[key].monthlyPaymentBig, Big(0)).times(localRateBig);
      }
    }
  });
  return outputBalanceSheetData;
}

/**
 * See computeOutputModel for purpose - this is a helper called from that method to avoid duplicating code
 * @param {Object} inputModel The input model
 * @param {string} currencyTo The currency requested to convert into
 * @param {Big} currencyConversionRateBig The currency conversion rate
 * @returns {Object} The output model
 */
function computeOutputModelInternal(inputModel, currencyTo, currencyConversionRateBig) {
  const outputModel = {};

  outputModel.assets = initializeOutputBalanceSheetItems(inputModel.assets, currencyConversionRateBig);
  outputModel.liabilities = initializeOutputBalanceSheetItems(inputModel.liabilities, currencyConversionRateBig);
  outputModel.currency = currencyTo;

  outputModel.calculated = {};
  outputModel.calculated.totalAssetsBig = computeLineItemTotal(outputModel.assets);
  outputModel.calculated.totalLiabilitiesBig = computeLineItemTotal(outputModel.liabilities);
  outputModel.calculated.netWorthBig =
    outputModel.calculated.totalAssetsBig.minus(outputModel.calculated.totalLiabilitiesBig);

  outputModel.calculated.futureNetWorth = computeFutureNetWorth(outputModel.assets, outputModel.liabilities);

  return outputModel;
}

/**
 * Returns an inputModel where all important members are available.
 * Does not mutate the input.
 * @param {*} inputModel The input
 * @returns {Object} The santized input model
 */
function sanitizeInputModel(inputModel) {
  const localInputModel = {};

  localInputModel.assets = inputModel && inputModel.assets ? inputModel.assets : {};
  localInputModel.liabilities = inputModel && inputModel.liabilities ? inputModel.liabilities : {};
  localInputModel.currency = inputModel && inputModel.currency ? inputModel.currency : 'USD';

  return localInputModel;
}

/**
 * Generates an output model with:
 * - The inputs, with currency conversion applied if necessary
 * - Calculated outputs
 * @param {*} inputModel The input model
 * @param {*} currencyTo The currency requested to convert into
 * @param {*} currencyConversionRateProvider A function that accepts a 'from' and 'to' currency and returns a
 * promise for the rate
 * @returns {Promise} A promise for the output model
 */
function computeOutputModel(inputModel, currencyTo, currencyConversionRateProvider) {
  const localInputModel = sanitizeInputModel(inputModel);

  let targetCurrency = localInputModel.currency;
  let providerPromise = Promise.resolve(Big(1)); // Default to a rate of 1 (no conversion)
  if (currencyTo && currencyTo !== localInputModel.currency && currencyConversionRateProvider) {
    targetCurrency = currencyTo;
    providerPromise = currencyConversionRateProvider(localInputModel.currency, currencyTo);
  }

  // TODO: This code isn't doing what I wanted; maybe the error should be handled upstream
  return providerPromise.then((currencyConversionRate) => {
    return computeOutputModelInternal(localInputModel, targetCurrency, currencyConversionRate);
  }).catch((err) => {
    util.logWithDate(`Failed to retrieve currency conversion rate from provider: ${err}`);

    // Can't do currency conversion but execute other computation steps
    // Retain the original currency since we couldn't do the conversion.
    return computeOutputModelInternal(localInputModel, localInputModel.currency, 1);
  });
}

module.exports = {
  getInitialModel,
  computeFutureNetWorth,
  computeOutputModel,
};
