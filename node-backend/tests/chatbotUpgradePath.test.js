const { analyzeUpgradePath, formatUpgradeContext } = require('../services/chatbotUpgradePath');

describe('chatbotUpgradePath (Upgrade Path Insights)', () => {
  test('evaluates AM5 build with generous PSU as High upgradeability', () => {
    const build = {
      cpu: { name: 'AMD Ryzen 5 7600', socket: 'AM5', tdp: 65 },
      motherboard: { name: 'ASUS PRIME B650M-A', socket: 'AM5', ram_type: 'DDR5' },
      ram: { name: 'Kingston Fury Beast 16GB DDR5 5600MHz' },
      gpu: { name: 'ZOTAC GAMING GeForce RTX 4060 8GB', tdp: 115 },
      storage: { name: 'WD Black SN770 1TB NVMe' },
      psu: { name: 'Corsair RM750e 750W 80+ Gold', wattage: 750 },
      case: { name: 'Montech AIR 100' }
    };

    const insight = analyzeUpgradePath(build);

    expect(insight.rating).toBe('High');
    expect(insight.score).toBeGreaterThanOrEqual(8);
    expect(insight.platform.socket).toBe('AM5');
    expect(insight.platform.longevity).toContain('2027');
    expect(insight.power.headroomWatts).toBeGreaterThanOrEqual(400);
    expect(insight.power.isGpuReady).toBe(true);
  });

  test('evaluates AM4 build with tight PSU as Moderate/Entry upgradeability', () => {
    const build = {
      cpu: { name: 'AMD Ryzen 5 5600', socket: 'AM4', tdp: 65 },
      motherboard: { name: 'Gigabyte B550M DS3H', socket: 'AM4', ram_type: 'DDR4' },
      gpu: { name: 'MSI Radeon RX 6600 8GB', tdp: 132 },
      psu: { name: 'AeroCool 500W', wattage: 500 }
    };

    const insight = analyzeUpgradePath(build);

    expect(insight.platform.socket).toBe('AM4');
    expect(insight.platform.longevity).toContain('Ryzen 5000');
    expect(insight.power.headroomWatts).toBeLessThan(300);
  });

  test('formatUpgradeContext generates structured text for LLM injection', () => {
    const build = {
      cpu: { name: 'Intel Core i5-12400F', socket: 'LGA1700', tdp: 65 },
      motherboard: { name: 'ASRock B660M Pro RS', socket: 'LGA1700', ram_type: 'DDR4' },
      gpu: { name: 'RTX 3060 12GB', tdp: 170 },
      psu: { name: 'SilverStone 650W', wattage: 650 }
    };

    const text = formatUpgradeContext(build);

    expect(text).toContain('[การวิเคราะห์เส้นทางอัปเกรดในอนาคต (Upgrade Path Insights)]');
    expect(text).toContain('LGA1700');
    expect(text).toContain('กำลังไฟสำรอง');
  });

  test('handles empty or partial builds gracefully', () => {
    const insight = analyzeUpgradePath({});
    expect(insight.rating).toBe('Unrated');
    expect(insight.score).toBe(0);

    const text = formatUpgradeContext({});
    expect(text).toBe('');
  });
});
