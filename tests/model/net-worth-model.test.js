const { expect } = require('chai');

const netWorthModel = require('../../src/model/net-worth-model');

describe('NetWorth Model - getInitialModel', () => {
  it('should return an initial model with assets, liabilities and currency elements', () => {
    const model = netWorthModel.getInitialModel();
    expect(model.assets).to.exist;
    expect(model.liabilities).to.exist;
    expect(model.currency).to.equal('USD');
  });
});

describe('NetWorth Model - computeOutputModel', () => {
  it('should compute outputs', (done) => {
    const inputModel = {
      assets: {
        LineItem01: {
          value: 1,
        },
        LineItem02: {
          value: 2,
        },
      },
      liabilities: {
        LineItem01: {
          value: 1,
        },
        LineItem02: {
          value: 1,
        },
      },
      currency: 'USD',
    };
    netWorthModel.computeOutputModel(inputModel).then((outputModel) => {
      expect(outputModel.calculated.totalAssets).to.equal(3);
      expect(outputModel.calculated.totalLiabilities).to.equal(2);
      expect(outputModel.calculated.netWorth).to.equal(1);
      expect(outputModel.currency).to.equal('USD');
      done();
    }).catch((e) => { done(e); });
  });

  it('Handles null input model', (done) => {
    currencyConversionRateProvider = () => Promise.reject();
    netWorthModel.computeOutputModel(null).then((outputModel) => {
      expect(outputModel.calculated.totalAssets).to.equal(0);
      expect(outputModel.calculated.totalLiabilities).to.equal(0);
      expect(outputModel.calculated.netWorth).to.equal(0);
      expect(outputModel.currency).to.equal('USD');
      done();
    }).catch((e) => { done(e); });
  });

  it('Handles malformed input model', (done) => {
    const inputModel = {
    };
    netWorthModel.computeOutputModel(inputModel).then((outputModel) => {
      expect(outputModel.assets).to.exist;
      expect(outputModel.liabilities).to.exist;
      expect(outputModel.currency).to.equal('USD');
      expect(outputModel.calculated.totalAssets).to.equal(0);
      expect(outputModel.calculated.totalLiabilities).to.equal(0);
      expect(outputModel.calculated.netWorth).to.equal(0);
      done();
    }).catch((e) => { done(e); });
  });

  it('Handles non-numeric values', (done) => {
    const inputModel = {
      assets: {
        LineItem01: {
          value: 'a',
        },
      },
      liabilities: {
        LineItem01: {
          value: 1,
        },
      },
      currency: 'USD',
    };
    netWorthModel.computeOutputModel(inputModel).then((outputModel) => {
      expect(outputModel.calculated.totalAssets).to.equal(0);
      expect(outputModel.calculated.totalLiabilities).to.equal(1);
      expect(outputModel.calculated.netWorth).to.equal(-1);
      done();
    }).catch((e) => { done(e); });
  });

  // TODO: Maybe https://github.com/MikeMcl/decimal.js/ will help...
  // it('Handles decimals up to a certain precision', (done) => {
  //   const inputModel = {
  //     assets: {
  //       LineItem01: {
  //         value: 1.01,
  //       },
  //       LineItem02: {
  //         value: 0.01,
  //       },
  //     },
  //     liabilities: {
  //       LineItem01: {
  //         value: 1,
  //       },
  //     },
  //     currency: 'USD',
  //   };
  //   netWorthModel.computeOutputModel(inputModel).then((outputModel) => {
  //     expect(outputModel.calculated.totalAssets).to.equal(1.02);
  //     expect(outputModel.calculated.totalLiabilities).to.equal(1);
  //     expect(outputModel.calculated.netWorth).to.equal(0.02);
  //     done();
  //   }).catch((e) => { done(e); });
  // });

  it('Handles currency conversion', (done) => {
    const inputModel = {
      assets: {
        LineItem01: {
          value: 2,
        },
      },
      liabilities: {
        LineItem01: {
          value: 1,
        },
      },
      currency: 'USD',
    };

    currencyConversionRateProvider = () => Promise.resolve(2);
    netWorthModel.computeOutputModel(inputModel, 'EUR', currencyConversionRateProvider).then((outputModel) => {
      expect(outputModel.currency).to.equal('EUR');
      expect(outputModel.calculated.totalAssets).to.equal(4);
      expect(outputModel.calculated.totalLiabilities).to.equal(2);
      expect(outputModel.calculated.netWorth).to.equal(2);
      done();
    }).catch((e) => { done(e); });
  });

  it('Still computes outputs when cannot get currency conversion rate', (done) => {
    const inputModel = {
      assets: {
        LineItem01: {
          value: 2,
        },
      },
      liabilities: {
        LineItem01: {
          value: 1,
        },
      },
      currency: 'USD',
    };

    currencyConversionRateProvider = () => Promise.reject();
    netWorthModel.computeOutputModel(inputModel, 'EUR', currencyConversionRateProvider).then((outputModel) => {
      expect(outputModel.currency).to.equal('USD');
      expect(outputModel.calculated.totalAssets).to.equal(2);
      expect(outputModel.calculated.totalLiabilities).to.equal(1);
      expect(outputModel.calculated.netWorth).to.equal(1);
      done();
    }).catch((e) => { done(e); });
  });
});

describe('NetWorth Model - computeFutureNetWorth', () => {
  it('should compute Net Worth', () => {
    const inputModel = {
      assets: {
        LineItem01: {
          interestRate: 50,
          value: 2000,
        },
        LineItem02: {
          interestRate: 25,
          value: 1000,
        },
      },
      liabilities: {
        LineItem01: {
          interestRate: 5,
          monthlyPayment: 50,
          value: 1000,
        },
        LineItem02: {
          interestRate: 10,
          monthlyPayment: 20,
          value: 500,
        },
      },
      currency: 'USD',
    };

    const futureNetWorth = netWorthModel.computeFutureNetWorth(inputModel.assets, inputModel.liabilities);

    const year01LineItem01Assets =
      inputModel.assets.LineItem01.value +
      (inputModel.assets.LineItem01.value * (inputModel.assets.LineItem01.interestRate / 100));
    const year01LineItem02Assets =
      inputModel.assets.LineItem02.value +
      (inputModel.assets.LineItem02.value * (inputModel.assets.LineItem02.interestRate / 100));
    const year01LineItem01Liabilities =
      (inputModel.liabilities.LineItem01.value +
      (inputModel.liabilities.LineItem01.value * (inputModel.liabilities.LineItem01.interestRate / 100))) -
      (inputModel.liabilities.LineItem01.monthlyPayment * 12);
    const year01LineItem02Liabilities =
      (inputModel.liabilities.LineItem02.value +
      (inputModel.liabilities.LineItem02.value * (inputModel.liabilities.LineItem02.interestRate / 100))) -
      (inputModel.liabilities.LineItem02.monthlyPayment * 12);
    const year01NetWorth =
      (year01LineItem01Assets + year01LineItem02Assets) -
      (year01LineItem01Liabilities > 0 ? year01LineItem01Liabilities : 0) -
      (year01LineItem02Liabilities > 0 ? year01LineItem02Liabilities : 0);
    expect(futureNetWorth[0]).to.equal(year01NetWorth);
    console.log('year01NetWorth: ', year01NetWorth);

    const year02LineItem01Assets =
      year01LineItem01Assets +
      (year01LineItem01Assets * (inputModel.assets.LineItem01.interestRate / 100));
    const year02LineItem02Assets =
      year01LineItem02Assets +
      (year01LineItem02Assets * (inputModel.assets.LineItem02.interestRate / 100));
    const year02LineItem01Liabilities =
      (year01LineItem01Liabilities +
      (year01LineItem01Liabilities * (inputModel.liabilities.LineItem01.interestRate / 100))) -
      (inputModel.liabilities.LineItem01.monthlyPayment * 12);
    const year02LineItem02Liabilities =
      (year01LineItem02Liabilities +
      (year01LineItem02Liabilities * (inputModel.liabilities.LineItem02.interestRate / 100))) -
      (inputModel.liabilities.LineItem02.monthlyPayment * 12);
    const year02NetWorth =
      (year02LineItem01Assets + year02LineItem02Assets) -
      (year02LineItem01Liabilities > 0 ? year02LineItem01Liabilities : 0) -
      (year02LineItem02Liabilities > 0 ? year02LineItem02Liabilities : 0);
    expect(futureNetWorth[1]).to.equal(year02NetWorth);
    console.log('year02NetWorth: ', year02NetWorth);
  });

  it('handles null inputs', () => {
    const futureNetWorth = netWorthModel.computeFutureNetWorth(null, null);
    expect(futureNetWorth[0]).to.equal(0);
  });

  it('handles empty inputs', () => {
    const inputModel = {
      assets: {
      },
      liabilities: {
      },
      currency: 'USD',
    };

    const futureNetWorth = netWorthModel.computeFutureNetWorth(inputModel.assets, inputModel.liabilities);
    expect(futureNetWorth[0]).to.equal(0);
  });
});
