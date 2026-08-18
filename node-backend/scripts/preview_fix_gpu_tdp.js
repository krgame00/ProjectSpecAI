require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../config/db');

// Accurate TDP (Total Board Power) mapping for desktop GPUs
function getAccurateGpuTdp(chipset, model, vramGb) {
  const cs = (chipset || '').toUpperCase();
  const m = (model || '').toUpperCase();

  if (cs.includes('5090') || m.includes('5090')) return 600;
  if (cs.includes('5080') || m.includes('5080')) return 400;
  if (cs.includes('5070 TI') || cs.includes('5070TI') || m.includes('5070 TI') || m.includes('5070TI')) return 300;
  if (cs.includes('5070') || m.includes('5070')) return 250;
  if (cs.includes('5060 TI') || cs.includes('5060TI') || m.includes('5060 TI') || m.includes('5060TI')) return 180;
  if (cs.includes('5060') || m.includes('5060')) return 140;
  if (cs.includes('5050') || m.includes('5050')) return 115;
  
  if (cs.includes('3050') || m.includes('3050')) {
    if (vramGb === 6 || m.includes('6GB') || m.includes('6G')) return 70;
    return 130;
  }

  if (cs.includes('9070 XT') || cs.includes('9070XT') || m.includes('9070 XT') || m.includes('9070XT')) return 300;
  if (cs.includes('9070 GRE') || cs.includes('9070GRE') || m.includes('9070 GRE') || m.includes('9070GRE')) return 220;
  if (cs.includes('9070') || m.includes('9070')) return 220;
  if (cs.includes('9060 XT') || cs.includes('9060XT') || m.includes('9060 XT') || m.includes('9060XT')) return 160;
  if (cs.includes('7600') || m.includes('7600')) return 165;
  if (cs.includes('6500 XT') || cs.includes('6500XT') || m.includes('6500 XT')) return 107;
  if (cs.includes('R9700') || cs.includes('R9070')) return 300;
  if (cs.includes('GT 610') || m.includes('GT 610')) return 29;
  if (cs.includes('GT 710') || m.includes('GT 710')) return 19;

  return 150; // fallback standard GPU TDP
}

async function previewFix() {
  const [gpus] = await db.query(`
    SELECT p.id, p.brand, p.model, g.chipset, g.vram_gb, g.tdp_watt as old_tdp
    FROM products p
    JOIN spec_gpu g ON p.id = g.product_id
  `);

  console.log(`Found ${gpus.length} GPUs in database.`);
  let countUpdated = 0;
  gpus.forEach(g => {
    const newTdp = getAccurateGpuTdp(g.chipset, g.model, g.vram_gb);
    if (g.old_tdp !== newTdp) {
      countUpdated++;
      console.log(`- [ID ${g.id}] ${g.brand} ${g.model} (${g.chipset}): ${g.old_tdp}W ➔ ${newTdp}W`);
    }
  });

  console.log(`\nTotal GPUs to update: ${countUpdated}/${gpus.length}`);
  if (db.pool) await db.pool.end();
}

previewFix().catch(console.error);
