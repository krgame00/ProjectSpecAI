const CATEGORY_OFFSETS = {
  cpu: 0,
  mobo: 10,
  ram: 20,
  gpu: 30,
  storage: 40,
  psu: 50,
  case: 60
};

const CATEGORY_PREFIXES = {
  cpu: 'c',
  mobo: 'm',
  ram: 'r',
  gpu: 'g',
  storage: 's',
  psu: 'p',
  case: 'case'
};

function mapDbIdToFrontendId(dbId, categorySlug) {
  const prefix = CATEGORY_PREFIXES[categorySlug];
  if (!prefix) return String(dbId);
  const offset = CATEGORY_OFFSETS[categorySlug] || 0;
  return `${prefix}${dbId - offset}`;
}

function mapFrontendIdToDbId(frontendId) {
  if (typeof frontendId === 'number') return frontendId;
  const strId = String(frontendId);
  if (/^\d+$/.test(strId)) return parseInt(strId, 10);

  const num = parseInt(strId.replace(/\D/g, ''), 10);
  if (strId.startsWith('case')) return num + CATEGORY_OFFSETS.case;
  if (strId.startsWith('c')) return num;
  if (strId.startsWith('m')) return num + CATEGORY_OFFSETS.mobo;
  if (strId.startsWith('r')) return num + CATEGORY_OFFSETS.ram;
  if (strId.startsWith('g')) return num + CATEGORY_OFFSETS.gpu;
  if (strId.startsWith('s')) return num + CATEGORY_OFFSETS.storage;
  if (strId.startsWith('p')) return num + CATEGORY_OFFSETS.psu;
  return num;
}

module.exports = { mapDbIdToFrontendId, mapFrontendIdToDbId, CATEGORY_OFFSETS, CATEGORY_PREFIXES };
