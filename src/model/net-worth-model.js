const util = require('../api/util');

/**
 * Returns an intialized model.
 * In a real app, would normally read this from a DB.
 * @returns {Object} The model
 */
function getInitialModel() {
  return {
    assets: {
      Chequing: {
        interestRate: 0,
        value: 2000,
        category: 'Cash and Investments',
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
      },
    },
    liabilities: {
      'Credit Card 1': {
        monthlyPayment: 200,
        interestRate: 50,
        value: 4342,
        category: 'Short Term Liabilities',
      },
      'Credit Card 2': {
        monthlyPayment: 150,
        interestRate: 22,
        value: 322,
        category: 'Short Term Liabilities',
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
      },
    },
    currency: 'USD',
  };
}

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
    let currentYearBalanceForAllAssets = 0;
    const currentYearAssetBalanceSheet = {};
    if (assetBalanceSheet && Object.keys(assetBalanceSheet).length > 0) {
      Object.keys(assetBalanceSheet).forEach((key) => {
        let currentYearBalanceForAsset = 0;
        if (year === 0) {
          if (util.isNumeric(assetBalanceSheet[key].value)) {
            currentYearBalanceForAsset = assetBalanceSheet[key].value;
          }
        } else {
          currentYearBalanceForAsset = allYearsAssetBalanceSheet[year - 1][key];
        }
        currentYearBalanceForAsset += currentYearBalanceForAsset * (assetBalanceSheet[key].interestRate / 100);

        currentYearAssetBalanceSheet[key] = currentYearBalanceForAsset;
        currentYearBalanceForAllAssets += currentYearBalanceForAsset;
      });
    }
    allYearsAssetBalanceSheet.push(currentYearAssetBalanceSheet);


    let currentYearBalanceForAllLiabilities = 0;
    const currentYearLiabilitiesBalanceSheet = {};
    if (liabilitiesBalanceSheet && Object.keys(liabilitiesBalanceSheet).length > 0) {
      Object.keys(liabilitiesBalanceSheet).forEach((key) => {
        let currentYearBalanceForLiability = 0;
        if (year === 0) {
          if (util.isNumeric(liabilitiesBalanceSheet[key].value)) {
            currentYearBalanceForLiability = liabilitiesBalanceSheet[key].value;
          }
        } else {
          currentYearBalanceForLiability = allYearsLiabilitiesBalanceSheet[year - 1][key];
        }

        // Original Principal + interest - payments over year
        currentYearBalanceForLiability =
          (currentYearBalanceForLiability +
          (currentYearBalanceForLiability * (liabilitiesBalanceSheet[key].interestRate / 100))) -
          (liabilitiesBalanceSheet[key].monthlyPayment * 12);

        currentYearLiabilitiesBalanceSheet[key] = currentYearBalanceForLiability;
        if (currentYearBalanceForLiability > 0) {
          currentYearBalanceForAllLiabilities += currentYearBalanceForLiability;
        }
      });
    }
    allYearsLiabilitiesBalanceSheet.push(currentYearLiabilitiesBalanceSheet);

    futureNetWorth.push(currentYearBalanceForAllAssets - currentYearBalanceForAllLiabilities);
  }

  return futureNetWorth;
}

/**
 * Adds up the values for line-items an a Balance Sheet class - eg adds up all Assets or Liabilities
 * @param {Object} balanceSheetData The line-items to add
 * @returns {number} The total
 */
function computeLineItemTotal(balanceSheetData) {
  let total = 0;
  Object.keys(balanceSheetData).forEach((key) => {
    if (util.isNumeric(balanceSheetData[key].value)) {
      total += balanceSheetData[key].value;
    }
  });
  return total;
}

/**
 * Copies items from inputBalanceSheetData into an equivalent output structure
 * and applies currency conversion if rate <> 1
 * Avoids mutating the input
 * @param {*} inputBalanceSheetData The input
 * @param {*} rate The conversion rate
 * @returns {Object} The output Balance Sheet items
 */
function initializeOutputBalanceSheetItems(inputBalanceSheetData, rate) {
  const outputBalanceSheetData = {};
  Object.keys(inputBalanceSheetData).forEach((key) => {
    outputBalanceSheetData[key] = Object.assign({}, inputBalanceSheetData[key]);

    // Apply currency conversion if necessary
    if (rate !== 1) {
      outputBalanceSheetData[key].value *= rate;
    }
  });
  return outputBalanceSheetData;
}

/**
 * See computeOutputModel for purpose - this is a helper called from that method to avoid duplicating code
 * @param {*} inputModel The input model
 * @param {*} currencyTo The currency requested to convert into
 * @param {*} currencyConversionRate The currency conversion rate
 * @returns {Object} The output model
 */
function computeOutputModelInternal(inputModel, currencyTo, currencyConversionRate) {
  const outputModel = {};

  outputModel.assets = initializeOutputBalanceSheetItems(inputModel.assets, currencyConversionRate);
  outputModel.liabilities = initializeOutputBalanceSheetItems(inputModel.liabilities, currencyConversionRate);
  outputModel.currency = currencyTo;

  outputModel.calculated = {};
  outputModel.calculated.totalAssets = computeLineItemTotal(outputModel.assets);
  outputModel.calculated.totalLiabilities = computeLineItemTotal(outputModel.liabilities);
  outputModel.calculated.netWorth = outputModel.calculated.totalAssets - outputModel.calculated.totalLiabilities;
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
  let providerPromise = Promise.resolve(1); // Default to a rate of 1 (no conversion)
  if (currencyTo && currencyTo !== localInputModel.currency && currencyConversionRateProvider) {
    targetCurrency = currencyTo;
    providerPromise = currencyConversionRateProvider(localInputModel.currency, currencyTo);
  }

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
