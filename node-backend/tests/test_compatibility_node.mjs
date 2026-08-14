import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcTotalTdp,
  checkSocket,
  checkRamCompatibility,
  extractPsuWattage,
  extractRamSpeedMhz,
  extractRamCapacityGb,
  hasIGPU,
  socketMatches,
  normalizeSocket
} from '../../frontend/src/utils/compatibility.js';

describe('Compatibility Engine - Socket & RAM Validation', () => {
  test('normalizeSocket removes spaces and handles numerical aliases', () => {
    assert.equal(normalizeSocket('LGA 1700'), 'LGA1700');
    assert.equal(normalizeSocket('lga 1851'), 'LGA1851');
    assert.equal(normalizeSocket('1155'), 'LGA1155');
    assert.equal(normalizeSocket('AM5'), 'AM5');
    assert.equal(normalizeSocket('sTRX5'), 'STRX5');
  });

  test('socketMatches correctly matches standardized and whitespace variants', () => {
    assert.equal(socketMatches('LGA1700', 'LGA 1700'), true);
    assert.equal(socketMatches('LGA 1851', 'LGA1851'), true);
    assert.equal(socketMatches('1155', 'LGA1155'), true);
    assert.equal(socketMatches('AM5', 'AM5'), true);
    assert.equal(socketMatches('AM4', 'AM4'), true);
    assert.equal(socketMatches('AM5', 'AM4'), false);
    assert.equal(socketMatches('LGA1700', 'LGA1851'), false);
  });

  test('checkSocket passes for normalized socket pairs', () => {
    const cpu = { name: 'Core i5-14400F', socket: 'LGA1700' };
    const mobo = { name: 'ASUS B760M-A', socket: 'LGA 1700' };
    const res = checkSocket(cpu, mobo);
    assert.equal(res[0].type, 'pass');
  });

  test('checkRamCompatibility passes for matching DDR types', () => {
    const mobo = { name: 'B650', ramType: 'DDR5' };
    const ramDDR5 = { name: '32GB DDR5', type: 'DDR5' };
    const ramDDR4 = { name: '16GB DDR4', type: 'DDR4' };
    
    const passRes = checkRamCompatibility(mobo, ramDDR5);
    assert.equal(passRes[0].type, 'pass');

    const failRes = checkRamCompatibility(mobo, ramDDR4);
    assert.equal(failRes[0].type, 'issue');
  });
});
