function computeLineItemTotal(balanceSheetData) {
    let total = 0;
    Object.keys(balanceSheetData).forEach(key => {
        total += balanceSheetData[key].value;
    });
    return total;
}

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

function computeOutputModel(inputModel) {
    // Make a copy of the model so we don't mutate the input
    // TODO: improve performance
    let outputModel = JSON.parse(JSON.stringify(inputModel));

    outputModel.totalAssets = computeLineItemTotal(inputModel.assets);
    outputModel.totalLiabilities = computeLineItemTotal(inputModel.liabilities);
    outputModel.netWorth = outputModel.totalAssets - outputModel.totalLiabilities;
  
    return outputModel;
}

module.exports = {
    getInitialModel,
    computeOutputModel,
}