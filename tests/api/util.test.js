const { expect } = require('chai');
const Big = require('big.js');

const util = require('../../src/api/util');

describe('util - convertToBig', () => {
  it('convert strings', () => {
    expect(util.convertToBig('2.5').eq(2.5), 'Should convert to Big representation of 2.5');
    expect(util.convertToBig('-2.5').eq(-2.5), 'Should convert to Big representation of -2.5');
    expect(util.convertToBig('0').eq(0), 'Should convert to Big representation of 0');
    expect(util.convertToBig('100,000').eq(100000), 'Should convert to Big representation of 100000');
  });

  it('passes Big right back', () => {
    const a = Big(1);
    expect(util.convertToBig(a)).to.equal(a);
  });

  it('returns default if number cannot be parsed', () => {
    expect(util.convertToBig('abc', Big(1).eq(Big(1))), 'Default value should be returned').to.be.true;
  });

  it('returns original input if number cannot be parsed and no default value', () => {
    expect(util.convertToBig('abc')).to.equal('abc');
    expect(util.convertToBig('')).to.equal('');
    expect(util.convertToBig(null)).to.equal(null);
  });
});
