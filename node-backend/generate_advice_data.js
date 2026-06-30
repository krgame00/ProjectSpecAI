const fs = require('fs');
const path = require('path');

const categories = [
  { slug: 'cpu', id: 1, brands: ['Intel', 'AMD'], models: { 'Intel': ['Core i3-12100F', 'Core i5-12400F', 'Core i5-13400F', 'Core i7-13700K', 'Core i9-13900K', 'Core i5-14400F', 'Core i7-14700K'], 'AMD': ['Ryzen 3 4100', 'Ryzen 5 5600G', 'Ryzen 5 7600X', 'Ryzen 7 5700X', 'Ryzen 7 7800X3D', 'Ryzen 9 7900X', 'Ryzen 9 7950X3D'] } },
  { slug: 'mobo', id: 2, brands: ['ASUS', 'GIGABYTE', 'MSI', 'ASROCK'], models: { 'ASUS': ['PRIME H610M-E', 'TUF GAMING B760M-PLUS', 'ROG STRIX Z790-A', 'PRIME A520M-K', 'TUF GAMING B650-PLUS'], 'GIGABYTE': ['H610M S2H', 'B760M DS3H', 'Z790 AORUS ELITE', 'B550M AORUS ELITE', 'X670 AORUS ELITE'], 'MSI': ['PRO H610M-B', 'MAG B760M MORTAR', 'MPG Z790 EDGE', 'B550-A PRO', 'MAG X670E TOMAHAWK'], 'ASROCK': ['H610M-HVS', 'B760M Pro RS', 'Z790 Steel Legend', 'B550M Pro4', 'X670E Taichi'] } },
  { slug: 'ram', id: 3, brands: ['KINGSTON', 'CORSAIR', 'G.SKILL', 'TEAMGROUP'], models: { 'KINGSTON': ['FURY BEAST DDR4 16GB 3200MHz', 'FURY RENEGADE DDR4 32GB 3600MHz', 'FURY BEAST DDR5 32GB 5600MHz'], 'CORSAIR': ['VENGEANCE LPX DDR4 16GB 3200MHz', 'DOMINATOR PLATINUM DDR5 32GB 6000MHz'], 'G.SKILL': ['TRIDENT Z RGB DDR4 16GB 3600MHz', 'TRIDENT Z5 NEO DDR5 32GB 6000MHz'], 'TEAMGROUP': ['T-FORCE VULCAN Z DDR4 16GB 3200MHz', 'DELTA RGB DDR5 32GB 6000MHz'] } },
  { slug: 'gpu', id: 4, brands: ['ASUS', 'GIGABYTE', 'MSI', 'ZOTAC', 'GALAX'], models: { 'ASUS': ['DUAL RTX 3060 12GB', 'TUF RTX 4070 12GB', 'ROG STRIX RTX 4090 24GB', 'DUAL RX 7600 8GB'], 'GIGABYTE': ['GAMING OC RTX 3060 Ti 8GB', 'AERO OC RTX 4070 Ti 12GB', 'GAMING OC RX 7800 XT 16GB'], 'MSI': ['VENTUS 2X RTX 4060 8GB', 'GAMING X TRIO RTX 4080 16GB', 'MECH 2X RX 6700 XT 12GB'], 'ZOTAC': ['TWIN EDGE RTX 4060 8GB', 'TRINITY RTX 4070 Ti 12GB'], 'GALAX': ['EX GAMER RTX 4060 Ti 8GB', 'SG RTX 4080 16GB'] } },
  { slug: 'storage', id: 5, brands: ['SAMSUNG', 'WD', 'KINGSTON', 'SEAGATE'], models: { 'SAMSUNG': ['970 EVO PLUS 500GB', '980 PRO 1TB', '990 PRO 2TB', '870 EVO 1TB'], 'WD': ['BLACK SN850X 1TB', 'BLUE SN580 500GB', 'BLUE 1TB 7200RPM', 'BLACK 2TB 7200RPM'], 'KINGSTON': ['NV2 500GB', 'KC3000 1TB', 'FURY RENEGADE 2TB'], 'SEAGATE': ['BARRACUDA 1TB 7200RPM', 'BARRACUDA 2TB 7200RPM', 'FIRECUDA 530 1TB'] } },
  { slug: 'psu', id: 6, brands: ['CORSAIR', 'THERMALTAKE', 'SEASONIC', 'SILVERSTONE'], models: { 'CORSAIR': ['CV650 650W 80+ BRONZE', 'RM750e 750W 80+ GOLD', 'RM850x 850W 80+ GOLD', 'HX1000i 1000W 80+ PLATINUM'], 'THERMALTAKE': ['SMART BX1 550W 80+ BRONZE', 'TOUGHPOWER GF1 750W 80+ GOLD'], 'SEASONIC': ['S12III 650W 80+ BRONZE', 'FOCUS GX-750 750W 80+ GOLD', 'PRIME TX-1000 1000W 80+ TITANIUM'], 'SILVERSTONE': ['VIVA 650W 80+ BRONZE', 'DECATHLON 850W 80+ GOLD'] } },
  { slug: 'case', id: 7, brands: ['NZXT', 'LIAN LI', 'CORSAIR', 'MONTECH', 'AEROCOOL'], models: { 'NZXT': ['H510 FLOW', 'H7 FLOW', 'H9 ELITE'], 'LIAN LI': ['O11 DYNAMIC EVO', 'LANCOOL 216', 'LANCOOL III'], 'CORSAIR': ['4000D AIRFLOW', '5000D AIRFLOW'], 'MONTECH': ['AIR 100 ARGB', 'SKY TWO'], 'AEROCOOL': ['CYLON RGB', 'AERO ONE FROST'] } }
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let products = [];
let idCounter = 1000;

categories.forEach(cat => {
  let catProducts = [];
  
  // Create 40 items for this category
  for (let i = 0; i < 40; i++) {
    const brand = cat.brands[getRandomInt(0, cat.brands.length - 1)];
    const models = cat.models[brand];
    const baseModel = models[getRandomInt(0, models.length - 1)];
    const variants = ['', '(Box)', '(MPK)', '(Tray)', '(Synnex)', '(WTG)'];
    const suffix = i > 0 ? variants[i % variants.length] : '';
    const model = `${baseModel} ${suffix} ${i > variants.length ? 'V.'+Math.floor(i/variants.length) : ''}`.trim().replace(/\s+/g, ' ');
    
    // Realistic Base Prices dictionary
    const basePrices = {
      'Core i3-12100F': 3150, 'Core i5-12400F': 4690, 'Core i5-13400F': 7190, 'Core i7-13700K': 14990, 'Core i9-13900K': 21490, 'Core i5-14400F': 7990, 'Core i7-14700K': 15990,
      'Ryzen 3 4100': 2590, 'Ryzen 5 5600G': 4590, 'Ryzen 5 7600X': 7890, 'Ryzen 7 5700X': 6390, 'Ryzen 7 7800X3D': 14900, 'Ryzen 9 7900X': 15500, 'Ryzen 9 7950X3D': 22900,
      
      'PRIME H610M-E': 2190, 'TUF GAMING B760M-PLUS': 5490, 'ROG STRIX Z790-A': 12900, 'PRIME A520M-K': 1890, 'TUF GAMING B650-PLUS': 7190,
      'H610M S2H': 2090, 'B760M DS3H': 3790, 'Z790 AORUS ELITE': 9890, 'B550M AORUS ELITE': 3290, 'X670 AORUS ELITE': 10590,
      'PRO H610M-B': 2090, 'MAG B760M MORTAR': 6190, 'MPG Z790 EDGE': 13500, 'B550-A PRO': 3890, 'MAG X670E TOMAHAWK': 11500,
      'H610M-HVS': 1990, 'B760M Pro RS': 4290, 'Z790 Steel Legend': 9590, 'B550M Pro4': 3190, 'X670E Taichi': 19900,

      'FURY BEAST DDR4 16GB 3200MHz': 1390, 'FURY RENEGADE DDR4 32GB 3600MHz': 2890, 'FURY BEAST DDR5 32GB 5600MHz': 3890,
      'VENGEANCE LPX DDR4 16GB 3200MHz': 1450, 'DOMINATOR PLATINUM DDR5 32GB 6000MHz': 5590,
      'TRIDENT Z RGB DDR4 16GB 3600MHz': 1990, 'TRIDENT Z5 NEO DDR5 32GB 6000MHz': 4890,
      'T-FORCE VULCAN Z DDR4 16GB 3200MHz': 1290, 'DELTA RGB DDR5 32GB 6000MHz': 3990,

      'DUAL RTX 3060 12GB': 9990, 'TUF RTX 4070 12GB': 24900, 'ROG STRIX RTX 4090 24GB': 78900, 'DUAL RX 7600 8GB': 9590,
      'GAMING OC RTX 3060 Ti 8GB': 12500, 'AERO OC RTX 4070 Ti 12GB': 32900, 'GAMING OC RX 7800 XT 16GB': 19900,
      'VENTUS 2X RTX 4060 8GB': 10900, 'GAMING X TRIO RTX 4080 16GB': 45900, 'MECH 2X RX 6700 XT 12GB': 11900,
      'TWIN EDGE RTX 4060 8GB': 10500, 'TRINITY RTX 4070 Ti 12GB': 30900,
      'EX GAMER RTX 4060 Ti 8GB': 13900, 'SG RTX 4080 16GB': 42900,

      '970 EVO PLUS 500GB': 1590, '980 PRO 1TB': 3590, '990 PRO 2TB': 6890, '870 EVO 1TB': 2590,
      'BLACK SN850X 1TB': 3690, 'BLUE SN580 500GB': 1390, 'BLUE 1TB 7200RPM': 1490, 'BLACK 2TB 7200RPM': 4590,
      'NV2 500GB': 1290, 'KC3000 1TB': 2990, 'FURY RENEGADE 2TB': 5590,
      'BARRACUDA 1TB 7200RPM': 1390, 'BARRACUDA 2TB 7200RPM': 1890, 'FIRECUDA 530 1TB': 3190,

      'CV650 650W 80+ BRONZE': 1890, 'RM750e 750W 80+ GOLD': 3890, 'RM850x 850W 80+ GOLD': 4890, 'HX1000i 1000W 80+ PLATINUM': 8500,
      'SMART BX1 550W 80+ BRONZE': 1590, 'TOUGHPOWER GF1 750W 80+ GOLD': 3590,
      'S12III 650W 80+ BRONZE': 1790, 'FOCUS GX-750 750W 80+ GOLD': 3990, 'PRIME TX-1000 1000W 80+ TITANIUM': 9590,
      'VIVA 650W 80+ BRONZE': 1690, 'DECATHLON 850W 80+ GOLD': 3490,

      'H510 FLOW': 2590, 'H7 FLOW': 4590, 'H9 ELITE': 8900,
      'O11 DYNAMIC EVO': 5590, 'LANCOOL 216': 2990, 'LANCOOL III': 5290,
      '4000D AIRFLOW': 2990, '5000D AIRFLOW': 5490,
      'AIR 100 ARGB': 1590, 'SKY TWO': 3190,
      'CYLON RGB': 1190, 'AERO ONE FROST': 1490
    };

    let price = basePrices[baseModel] || (getRandomInt(2, 10) * 1000);
    // Add small random variation to revisions so they look real
    if (i > 0) {
      price += (getRandomInt(-5, 5) * 100);
    }

    let socket = '', tdp = 0, ramType = '', wattage = 0;
    if(cat.slug === 'cpu') { socket = brand === 'Intel' ? 'LGA1700' : 'AM5'; tdp = getRandomInt(65, 125); }
    if(cat.slug === 'mobo') { socket = model.includes('H610') || model.includes('B760') || model.includes('Z790') ? 'LGA1700' : 'AM5'; ramType = model.includes('H610') ? 'DDR4' : 'DDR5'; }
    if(cat.slug === 'ram') { ramType = model.includes('DDR4') ? 'DDR4' : 'DDR5'; }
    if(cat.slug === 'gpu') { tdp = getRandomInt(100, 350); }
    if(cat.slug === 'psu') { wattage = getRandomInt(550, 1000); }

    catProducts.push({
      id: idCounter++,
      category_id: cat.id,
      category_slug: cat.slug,
      brand,
      model,
      price,
      image_url: `/images/${cat.slug}.png`,
      cpu_socket: socket,
      cpu_tdp: tdp,
      mobo_socket: socket,
      mobo_ram_type: ramType,
      ram_type: ramType,
      gpu_tdp: tdp,
      psu_wattage: wattage,
      form_factor_support: 'ATX'
    });
  }
  
  products = products.concat(catProducts);
});

fs.writeFileSync('generated_advice_data.json', JSON.stringify(products, null, 2));

console.log(`Generated ${products.length} products. Modifying db.js...`);

const dbJsPath = path.join(__dirname, 'config', 'db.js');
let dbJs = fs.readFileSync(dbJsPath, 'utf8');

// Replace mockProducts array inside db.js
const regex = /const mockProducts = \[[\s\S]*?\];/;
const newMockProducts = `const mockProducts = ${JSON.stringify(products, null, 2)};`;
dbJs = dbJs.replace(regex, newMockProducts);

fs.writeFileSync(dbJsPath, dbJs);
console.log('✅ Updated db.js with 280 generated items!');
