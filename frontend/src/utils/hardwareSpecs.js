/**
 * Clean raw specifications object by stripping out junk web tags
 * @param {Object} item 
 * @returns {Object}
 */
export function cleanSpecs(item) {
  if (!item || !item.specifications || typeof item.specifications !== 'object') {
    return {};
  }
  const clean = {};
  const junkPattern = /<|href|iframe|script|style|googletagmanager|ad_storage|analytics_storage|fill|stroke|evenodd|overflow|font-size|translate|svg|g id|use overflow|color:/i;
  for (const [k, v] of Object.entries(item.specifications)) {
    if (!junkPattern.test(k) && !junkPattern.test(String(v)) && v !== null && v !== undefined && String(v).trim() !== '') {
      clean[k] = v;
    }
  }
  return clean;
}

/**
 * Normalizes and formats item specifications for consistent UI display
 * across HardwareSelection, PriceSummary, and modal views.
 * 
 * @param {string} catId Category ID (cpu, mobo, ram, gpu, storage, psu, case)
 * @param {Object} item Hardware product object
 * @returns {Array<{label: string, value: string}>}
 */
export function getItemSpecsList(catId, item) {
  if (!item) return [];
  const specs = [];
  const s = item.specifications || {};

  if (catId === 'cpu') {
    const socket = item.socket || s['Socket Type'] || s['CPU Socket'];
    if (socket) specs.push({ label: 'Socket', value: socket });
    const cores = item.cores || s['Cores'];
    if (cores) {
      let coreVal = String(cores).replace(/Cores?/i, '').trim();
      const n = (item.name || '').toUpperCase();
      if (coreVal === '10' && (n.includes('14400') || n.includes('13400') || n.includes('12600') || n.includes('225'))) {
        coreVal = '10 (6P+4E)';
      } else if (coreVal === '14' && (n.includes('14600') || n.includes('13600') || n.includes('250'))) {
        coreVal = '14 (6P+8E)';
      } else if (coreVal === '20' && (n.includes('14700') || n.includes('13700') || n.includes('270'))) {
        coreVal = '20 (8P+12E)';
      } else if (coreVal === '24' && (n.includes('14900') || n.includes('13900') || n.includes('285'))) {
        coreVal = '24 (8P+16E)';
      }
      specs.push({ label: 'Cores', value: coreVal });
    }
    const threads = item.threads || s['Threads'];
    if (threads) specs.push({ label: 'Threads', value: String(threads).replace(/Threads?/i, '').trim() });
    const tdp = item.tdp || s['TDP'];
    if (tdp) specs.push({ label: 'TDP', value: typeof tdp === 'number' ? `${tdp}W` : (String(tdp).endsWith('W') ? tdp : `${tdp}W`) });
  } else if (catId === 'mobo') {
    const socket = item.socket || s['CPU Socket'] || s['Socket Type'];
    if (socket) specs.push({ label: 'Socket', value: socket });
    const ram = item.ramType || s['Memory Type'];
    if (ram) specs.push({ label: 'RAM', value: ram });
    const form = item.formFactor || s['Form Factor'];
    if (form) specs.push({ label: 'Form', value: form });
    if (s['Max Memory']) specs.push({ label: 'Max RAM', value: s['Max Memory'] });
  } else if (catId === 'ram') {
    const type = item.type || s['Memory Type'] || (item.name?.includes('DDR5') ? 'DDR5' : 'DDR4');
    if (type) specs.push({ label: 'Type', value: type });
    const cap = s['Capacity'] || (item.capacityGb ? `${item.capacityGb} GB` : s['Memory Capacity']);
    if (cap) specs.push({ label: 'Capacity', value: cap });
    const speed = item.busSpeed ? `${item.busSpeed} MHz` : (s['Speed'] || s['Memory Speed']);
    if (speed) specs.push({ label: 'Speed', value: typeof speed === 'number' ? `${speed} MHz` : speed });
    const color = s['Color'] || (/WHITE/i.test(item.name) ? 'White' : (/SILVER/i.test(item.name) ? 'Silver' : (/RGB/i.test(item.name) ? 'RGB Black' : 'Black')));
    if (color) specs.push({ label: 'Color', value: color });
  } else if (catId === 'gpu') {
    const chipset = s['GPU Model'] || item.chipset;
    if (chipset) specs.push({ label: 'Chipset', value: chipset });
    const vram = s['VRAM'] || (item.vramGb ? `${item.vramGb} GB` : s['Memory Size']);
    if (vram) specs.push({ label: 'VRAM', value: vram });
    const len = item.lengthMm || item.specifications?.['Length (mm)'] || s['Dimension'];
    if (len) specs.push({ label: 'Length', value: typeof len === 'number' ? `${len} mm` : (String(len).includes('mm') ? len : `${len} mm`) });
    const psu = item.tdp || s['Power Requirement'] || s['Power Supply Requirement'];
    if (psu) specs.push({ label: 'Rec. PSU', value: typeof psu === 'number' ? `${psu}W` : (String(psu).endsWith('W') ? psu : `${psu}W`) });
  } else if (catId === 'storage') {
    const type = item.type || s['Type'] || s['Form Factor'] || s['Interface'];
    if (type) specs.push({ label: 'Type', value: type });
    const cap = item.capacityGb ? (item.capacityGb >= 1000 ? `${item.capacityGb / 1000} TB` : `${item.capacityGb} GB`) : s['Capacity'];
    if (cap && cap !== '0 GB') specs.push({ label: 'Capacity', value: cap });
    const read = item.readSpeedMbs ? `${item.readSpeedMbs} MB/s` : s['Read Speed'];
    if (read) specs.push({ label: 'Read', value: typeof read === 'number' ? `${read} MB/s` : read });
    const write = item.writeSpeedMbs ? `${item.writeSpeedMbs} MB/s` : s['Write Speed'];
    if (write) specs.push({ label: 'Write', value: typeof write === 'number' ? `${write} MB/s` : write });
  } else if (catId === 'psu') {
    const w = item.wattage || s['Wattage'] || s['Continuous Power W'];
    if (w) specs.push({ label: 'Power', value: typeof w === 'number' ? `${w}W` : (String(w).endsWith('W') ? w : `${w}W`) });
    const eff = item.efficiencyRating || s['Efficiency'] || s['80 Plus'];
    if (eff) specs.push({ label: 'Efficiency', value: eff });
    const mod = s['Modularity'] || (item.name?.includes('GOLD') || item.name?.includes('PLATINUM') ? 'Full Modular' : 'Non-Modular');
    if (mod) specs.push({ label: 'Modular', value: mod });
    const fan = s['Fan Size'] || '120 mm';
    if (fan) specs.push({ label: 'Fan Size', value: fan });
  } else if (catId === 'case') {
    const form = s['Form Factor'] || (item.name?.includes('MINI-ITX') ? 'Mini-ITX' : (item.name?.includes('mATX') ? 'Micro-ATX' : 'Mid Tower'));
    if (form) specs.push({ label: 'Form', value: form });
    const board = item.formFactorSupport || s['Motherboard Support'] || s['Form Factor Support'];
    if (board) specs.push({ label: 'Board', value: board });
    const g = item.maxGpuLength || s['Max GPU Length'] || s['VGA Support'];
    if (g) specs.push({ label: 'Max GPU', value: typeof g === 'number' ? `${g} mm` : (String(g).includes('mm') ? g : `${g} mm`) });
    const color = s['Color'] || (/WHITE/i.test(item.name) ? 'White' : (/PINK/i.test(item.name) ? 'Pink' : 'Black'));
    if (color) specs.push({ label: 'Color', value: color });
  }
  return specs;
}
