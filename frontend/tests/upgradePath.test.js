import { describe, it, expect } from 'vitest';
import { analyzeUpgradePath, getUpgradeTierBadge } from '../src/utils/upgradePath';

describe('upgradePath (Frontend Utility)', () => {
  it('identifies AM5 platform with high longevity and DDR5', () => {
    const build = {
      cpu: { name: 'AMD Ryzen 5 7500F', socket: 'AM5', tdp: 65 },
      mobo: { name: 'MSI PRO B650M-P', socket: 'AM5', ram_type: 'DDR5' },
      ram: { name: 'Corsair Vengeance 16GB DDR5 5200' },
      gpu: { name: 'RTX 4060', tdp: 115 },
      psu: { name: 'Corsair CV650', wattage: 650 }
    };

    const res = analyzeUpgradePath(build);

    expect(res.rating).toBe('High');
    expect(res.score).toBeGreaterThanOrEqual(8);
    expect(res.platform.label).toContain('AM5');
    expect(res.power.headroomWatts).toBeGreaterThan(300);
    expect(res.tips.length).toBeGreaterThan(0);
  });

  it('identifies power bottleneck when headroom is under 100W', () => {
    const build = {
      cpu: { name: 'Intel Core i7-14700K', socket: 'LGA1700', tdp: 253 },
      gpu: { name: 'RTX 3080 10GB', tdp: 320 },
      psu: { name: 'Standard 600W', wattage: 600 }
    };

    const res = analyzeUpgradePath(build);

    expect(res.power.headroomWatts).toBeLessThan(100);
    expect(res.power.isTight).toBe(true);
    expect(res.tips.some(t => t.includes('PSU'))).toBe(true);
  });

  it('maps rating to appropriate badge class and Thai text', () => {
    expect(getUpgradeTierBadge('High').text).toBe('อัปเกรดได้ยาวไกล');
    expect(getUpgradeTierBadge('High').color).toBe('emerald');
    expect(getUpgradeTierBadge('Medium').text).toBe('อัปเกรดได้ปานกลาง');
    expect(getUpgradeTierBadge('Entry').text).toBe('เน้นคุ้มค่าปัจจุบัน');
  });

  it('returns empty safe defaults on empty build', () => {
    const res = analyzeUpgradePath(null);
    expect(res.score).toBe(0);
    expect(res.rating).toBe('Unrated');
    expect(res.tips).toEqual([]);
  });
});
