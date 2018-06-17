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
