// ============================================================
// PCSpec — Frontend Upgrade Path Insights Engine
// Pure analytical utility for evaluating platform longevity,
// PSU headroom, and upgrade tier badges.
// ============================================================

export const extractSocket = (item) => {
  if (!item) return null;
  if (item.socket) return String(item.socket).trim().toUpperCase();
  const raw = String(item.name || '');
  if (/AM5\b/i.test(raw)) return 'AM5';
  if (/AM4\b/i.test(raw)) return 'AM4';
  if (/LGA\s*1851|1851/i.test(raw)) return 'LGA1851';
  if (/LGA\s*1700|1700/i.test(raw)) return 'LGA1700';
  if (/LGA\s*1200|1200/i.test(raw)) return 'LGA1200';
  return null;
};

export const extractPsuWattage = (psu) => {
  if (!psu) return null;
  if (psu.wattage != null && !isNaN(Number(psu.wattage))) return Number(psu.wattage);
  const raw = String(psu.name || psu.model || psu.specifications?.['Wattage'] || '');
  const m = raw.match(/(\d{3,4})\s*W/i);
  return m ? Number(m[1]) : null;
};

export const extractTdp = (item, fallback = 65) => {
  if (!item) return 0;
  if (item.tdp != null && !isNaN(Number(item.tdp))) return Number(item.tdp);
  const raw = String(item.name || item.model || item.specifications?.['TDP'] || '');
  const m = raw.match(/(\d{2,3})\s*W/i);
  return m ? Number(m[1]) : fallback;
};

export const analyzeUpgradePath = (build) => {
  if (!build || typeof build !== 'object') {
    return { rating: 'Unrated', score: 0, platform: {}, power: {}, memory: {}, tips: [] };
  }

  const cpu = build.cpu || null;
  const mobo = build.motherboard || build.mobo || null;
  const gpu = build.gpu || null;
  const psu = build.psu || null;
  const ram = build.ram || null;

  if (!cpu && !mobo && !gpu && !psu) {
    return { rating: 'Unrated', score: 0, platform: {}, power: {}, memory: {}, tips: [] };
  }

  const socket = extractSocket(cpu) || extractSocket(mobo) || 'UNKNOWN';
  let platformScore = 5;
  let socketLongevity = 'แพลตฟอร์มรุ่นเดิม มีทางเลือกอัปเกรดจำกัด';

  if (socket === 'AM5') {
    platformScore = 9;
    socketLongevity = 'แพลตฟอร์ม AM5 รองรับ CPU AMD รุ่นใหม่ (Ryzen 9000 และรุ่นถัดไป) ได้ยาวถึงปี 2027+';
  } else if (socket === 'LGA1851') {
    platformScore = 8.5;
    socketLongevity = 'แพลตฟอร์ม LGA1851 ใหม่ล่าสุด รองรับตระกูล Intel Core Ultra';
  } else if (socket === 'AM4') {
    platformScore = 6;
    socketLongevity = 'แพลตฟอร์ม AM4 คุ้มค่าในงบประหยัด สิ้นสุดสายหลัก อัปเกรดสูงสุดได้ที่ Ryzen 5000 / 5000X3D';
  } else if (socket === 'LGA1700') {
    platformScore = 6;
    socketLongevity = 'แพลตฟอร์ม Intel LGA1700 สิ้นสุดที่ Gen 14 อัปเกรดได้ในกลุ่ม Core i7/i9 (Gen 13/14)';
  }

  const cpuTdp = cpu ? extractTdp(cpu, 65) : 0;
  const gpuTdp = gpu ? extractTdp(gpu, 130) : 0;
  const baseTdp = (cpu || mobo) ? 60 : 0;
  const estimatedTotalTdp = cpuTdp + gpuTdp + baseTdp;

  const psuWatts = extractPsuWattage(psu);
  let headroomWatts = 0;
  let isGpuReady = false;
  let isTight = false;
  let powerText = 'ยังไม่ได้ระบุพาวเวอร์ซัพพลาย (PSU)';

  if (psuWatts) {
    headroomWatts = Math.max(0, psuWatts - estimatedTotalTdp);
    if (headroomWatts >= 250) {
      isGpuReady = true;
      isTight = false;
      powerText = `มีกำลังไฟสำรองสูง (~${headroomWatts}W) รองรับการอัปเกรดการ์ดจอระดับกลาง-สูงในอนาคตได้สบาย`;
    } else if (headroomWatts >= 100) {
      isGpuReady = false;
      isTight = false;
      powerText = `มีกำลังไฟสำรองปานกลาง (~${headroomWatts}W) เพียงพอกับการใช้งานปัจจุบัน`;
    } else {
      isGpuReady = false;
      isTight = true;
      powerText = `กำลังไฟสำรองเหลือน้อย (<100W) แนะนำเพิ่มขนาด PSU เป็น 650W - 750W`;
    }
  }

  let totalScore = platformScore;
  if (psuWatts) {
    if (headroomWatts >= 300) totalScore += 1;
    if (isTight) totalScore -= 1.5;
  }
  totalScore = Math.min(10, Math.max(1, Math.round(totalScore * 10) / 10));

  let rating = 'Medium';
  if (totalScore >= 8) rating = 'High';
  else if (totalScore < 5.5) rating = 'Entry';

  const tips = [];
  if (socketLongevity) tips.push(socketLongevity);
  if (powerText && psuWatts) tips.push(powerText);
  if (isTight) tips.push('แนะนำอัปเกรด PSU เพื่อรองรับการเปลี่ยนการ์ดจอในอนาคต');

  return {
    rating,
    score: totalScore,
    platform: {
      socket,
      label: socket === 'UNKNOWN' ? 'ยังไม่ระบุ' : socket,
      longevity: socketLongevity,
    },
    power: {
      psuWatts,
      estimatedTotalTdp,
      headroomWatts,
      isGpuReady,
      isTight,
      description: powerText,
    },
    memory: {
      ramType: mobo?.ram_type || (ram?.name?.includes('DDR5') ? 'DDR5' : (ram?.name?.includes('DDR4') ? 'DDR4' : 'DDR4/DDR5')),
    },
    tips,
  };
};

export const getUpgradeTierBadge = (rating) => {
  switch (rating) {
    case 'High':
      return { text: 'อัปเกรดได้ยาวไกล', color: 'emerald', class: 'badge-high' };
    case 'Medium':
      return { text: 'อัปเกรดได้ปานกลาง', color: 'cyan', class: 'badge-medium' };
    case 'Entry':
      return { text: 'เน้นคุ้มค่าปัจจุบัน', color: 'amber', class: 'badge-entry' };
    default:
      return { text: 'รอข้อมูลชิ้นส่วน', color: 'gray', class: 'badge-unrated' };
  }
};
