const { expect } = require('chai');
const Big = require('big.js');

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
          valueBig: Big(1),
        },
        LineItem02: {
          valueBig: Big(2),
        },
      },
      liabilities: {
        LineItem01: {
          valueBig: Big(1),
        },
        LineItem02: {
          valueBig: Big(1),
        },
      },
      currency: 'USD',
    };
    netWorthModel.computeOutputModel(inputModel).then((outputModel) => {
      expect(outputModel.calculated.totalAssetsBig.eq(3), 'total assets').to.be.true;
      expect(outputModel.calculated.totalLiabilitiesBig.eq(2), 'total liabilities').to.be.true;
      expect(outputModel.calculated.netWorthBig.eq(1), 'net worth').to.be.true;
      expect(outputModel.currency).to.equal('USD');
      done();
    }).catch((e) => { done(e); });
  });

  it('Handles null input model', (done) => {
    currencyConversionRateProvider = () => Promise.reject();
    netWorthModel.computeOutputModel(null).then((outputModel) => {
      expect(outputModel.calculated.totalAssetsBig.eq(0), 'total assets should be 0').to.be.true;
      expect(outputModel.calculated.totalLiabilitiesBig.eq(0), 'total liabilies should be 0').to.be.true;
      expect(outputModel.calculated.netWorthBig.eq(0), 'net worth should be 0').to.be.true;
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
      expect(outputModel.calculated.totalAssetsBig.eq(0), 'total assets should be 0').to.be.true;
      expect(outputModel.calculated.totalLiabilitiesBig.eq(0), 'total liabilies should be 0').to.be.true;
      expect(outputModel.calculated.netWorthBig.eq(0), 'net worth should be 0').to.be.true;
      done();
    }).catch((e) => { done(e); });
  });

  it('Handles non-numeric values', (done) => {
    const inputModel = {
      assets: {
        LineItem01: {
          valueBig: 'a',
        },
      },
      liabilities: {
        LineItem01: {
          valueBig: Big(1),
        },
      },
      currency: 'USD',
    };
    netWorthModel.computeOutputModel(inputModel).then((outputModel) => {
      expect(outputModel.calculated.totalAssetsBig.eq(0), 'total assets should be 0').to.be.true;
      expect(outputModel.calculated.totalLiabilitiesBig.eq(1), 'total liabilies should be 1').to.be.true;
      expect(outputModel.calculated.netWorthBig.eq(-1), 'net worth should be -1').to.be.true;
      done();
    }).catch((e) => { done(e); });
  });

  it('Handles decimals without loss of precision', (done) => {
    const inputModel = {
      assets: {
        LineItem01: {
          valueBig: Big(1.00000001),
        },
        LineItem02: {
          valueBig: Big(0.00000001),
        },
      },
      liabilities: {
        LineItem01: {
          valueBig: Big(1),
        },
      },
      currency: 'USD',
    };
    netWorthModel.computeOutputModel(inputModel).then((outputModel) => {
      expect(outputModel.calculated.totalAssetsBig.eq(1.00000002), 'total assets').to.be.true;
      expect(outputModel.calculated.totalLiabilitiesBig.eq(1), 'total liabilies').to.be.true;
      expect(outputModel.calculated.netWorthBig.eq(0.00000002), 'net worth').to.be.true;
      done();
    }).catch((e) => { done(e); });
  });

  it('Handles currency conversion', (done) => {
    const inputModel = {
      assets: {
        LineItem01: {
          valueBig: Big(2),
        },
      },
      liabilities: {
        LineItem01: {
          valueBig: Big(1),
        },
      },
      currency: 'USD',
    };

    currencyConversionRateProvider = () => Promise.resolve(Big(2));
    netWorthModel.computeOutputModel(inputModel, 'EUR', currencyConversionRateProvider).then((outputModel) => {
      expect(outputModel.currency).to.equal('EUR');
      expect(outputModel.calculated.totalAssetsBig.eq(4), 'total assets:').to.be.true;
      expect(outputModel.calculated.totalLiabilitiesBig.eq(2), 'total liabilies').to.be.true;
      expect(outputModel.calculated.netWorthBig.eq(2), 'net worth').to.be.true;
      done();
    }).catch((e) => { done(e); });
  });

  it('Handles currency conversion with non-Big.js converion rates returned by 3rd-party rate service, by converting to Big.js', (done) => {
    const inputModel = {
      assets: {
        LineItem01: {
          valueBig: Big(2),
        },
      },
      liabilities: {
        LineItem01: {
          valueBig: Big(1),
        },
      },
      currency: 'USD',
    };

    // Test that it can handle a regular JS number (should convert to Big)
    currencyConversionRateProvider = () => Promise.resolve(2);
    netWorthModel.computeOutputModel(inputModel, 'EUR', currencyConversionRateProvider).then((outputModel) => {
      expect(outputModel.calculated.totalAssetsBig.eq(4), 'total assets:').to.be.true;
    }).catch((e) => { done(e); });

    // Test that it can handle a JS String (should convert to Big)
    currencyConversionRateProvider2 = () => Promise.resolve("2");
    netWorthModel.computeOutputModel(inputModel, 'EUR', currencyConversionRateProvider).then((outputModel) => {
      expect(outputModel.calculated.totalAssetsBig.eq(4), 'total assets:').to.be.true;
      done();
    }).catch((e) => { done(e); });
  });

  it('Ignores bad conversion rates', (done) => {
    const inputModel = {
      assets: {
        LineItem01: {
          valueBig: Big(2),
        },
      },
      liabilities: {
        LineItem01: {
          valueBig: Big(1),
        },
      },
      currency: 'USD',
    };

    // Should not apply a bad conversion rate
    currencyConversionRateProvider2 = () => Promise.resolve("a");
    netWorthModel.computeOutputModel(inputModel, 'USD', currencyConversionRateProvider).then((outputModel) => {
      expect(outputModel.calculated.totalAssetsBig.eq(2), 'total assets:').to.be.true;
      done();
    }).catch((e) => { done(e); });
  });

  it('Still computes outputs when cannot get currency conversion rate', (done) => {
    const inputModel = {
      assets: {
        LineItem01: {
          valueBig: Big(2),
        },
      },
      liabilities: {
        LineItem01: {
          valueBig: Big(1),
        },
      },
      currency: 'USD',
    };

    currencyConversionRateProvider = () => Promise.reject();
    netWorthModel.computeOutputModel(inputModel, 'EUR', currencyConversionRateProvider).then((outputModel) => {
      expect(outputModel.currency).to.equal('USD');
      expect(outputModel.calculated.totalAssetsBig.eq(2), 'total assets:').to.be.true;
      expect(outputModel.calculated.totalLiabilitiesBig.eq(1), 'total liabilies').to.be.true;
      expect(outputModel.calculated.netWorthBig.eq(1), 'net worth').to.be.true;
      done();
    }).catch((e) => { done(e); });
  });
});

describe('NetWorth Model - computeFutureNetWorth', () => {
  it('should compute Net Worth', () => {
    const inputModel = {
      assets: {
        LineItem01: {
          interestRateBig: Big(50),
          valueBig: Big(2000),
        },
        LineItem02: {
          interestRateBig: Big(25),
          valueBig: Big(1000),
        },
      },
      liabilities: {
        LineItem01: {
          interestRateBig: Big(5),
          monthlyPaymentBig: Big(50),
          valueBig: Big(1000),
        },
        LineItem02: {
          interestRateBig: Big(10),
          monthlyPaymentBig: Big(20),
          valueBig: Big(500),
        },
      },
      currency: 'USD',
    };

    const futureNetWorth = netWorthModel.computeFutureNetWorth(inputModel.assets, inputModel.liabilities);

    const year01LineItem01Assets =
      inputModel.assets.LineItem01.valueBig.plus(
        inputModel.assets.LineItem01.valueBig.times(inputModel.assets.LineItem01.interestRateBig.div(100)),
      );
    const year01LineItem02Assets =
      inputModel.assets.LineItem02.valueBig.plus(
        inputModel.assets.LineItem02.valueBig.times(inputModel.assets.LineItem02.interestRateBig.div(100)),
      );
    const year01LineItem01Liabilities =
      inputModel.liabilities.LineItem01.valueBig.plus(
        inputModel.liabilities.LineItem01.valueBig.times(
          inputModel.liabilities.LineItem01.interestRateBig.div(100),
        ),
      ).minus(
        inputModel.liabilities.LineItem01.monthlyPaymentBig.times(12),
      );
    const year01LineItem02Liabilities =
      inputModel.liabilities.LineItem02.valueBig.plus(
        inputModel.liabilities.LineItem02.valueBig.times(
          inputModel.liabilities.LineItem02.interestRateBig.div(100),
        ),
      ).minus(
        inputModel.liabilities.LineItem02.monthlyPaymentBig.times(12),
      );
    const year01NetWorth =
      year01LineItem01Assets.plus(year01LineItem02Assets).minus(
        year01LineItem01Liabilities.gt(0) ? year01LineItem01Liabilities : Big(0),
      ).minus(
        year01LineItem02Liabilities.gt(0) ? year01LineItem02Liabilities : Big(0),
      );
    expect(
      futureNetWorth[0].eq(year01NetWorth),
      `First future year net worth did not equal the expected total
      - expected: ${year01NetWorth.toString()},
      actual: ${futureNetWorth[0].toString()}`,
    ).to.be.true;

    const year02LineItem01Assets =
      year01LineItem01Assets.plus(
        year01LineItem01Assets.times(inputModel.assets.LineItem01.interestRateBig.div(100)),
      );
    const year02LineItem02Assets =
      year01LineItem02Assets.plus(
        year01LineItem02Assets.times(inputModel.assets.LineItem02.interestRateBig.div(100)),
      );
    const year02LineItem01Liabilities =
      year01LineItem01Liabilities.plus(
        year01LineItem01Liabilities.times(
          inputModel.liabilities.LineItem01.interestRateBig.div(100),
        ),
      ).minus(
        inputModel.liabilities.LineItem01.monthlyPaymentBig.times(12),
      );
    const year02LineItem02Liabilities =
      year01LineItem02Liabilities.plus(
        year01LineItem02Liabilities.times(
          inputModel.liabilities.LineItem02.interestRateBig.div(100),
        ),
      ).minus(
        inputModel.liabilities.LineItem02.monthlyPaymentBig.times(12),
      );
    const year02NetWorth =
      year02LineItem01Assets.plus(year02LineItem02Assets).minus(
        year02LineItem01Liabilities.gt(0) ? year02LineItem01Liabilities : Big(0),
      ).minus(
        year02LineItem02Liabilities.gt(0) ? year02LineItem02Liabilities : Big(0),
      );
    expect(
      futureNetWorth[1].eq(year02NetWorth),
      `Second future year net worth did not equal the expected total
        - expected: ${year02NetWorth.toString()},
        actual: ${futureNetWorth[1].toString()}`,
    ).to.be.true;
  });

  it('handles null inputs', () => {
    const futureNetWorth = netWorthModel.computeFutureNetWorth(null, null);
    expect(futureNetWorth[0].eq(0), 'Future net worth should be 0 since no input').to.be.true;
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
    expect(futureNetWorth[0].eq(0), 'Future net worth should be 0 since no input').to.be.true;
  });
});
