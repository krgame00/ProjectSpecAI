// ============================================================
// PCSpec — SpecAI Upgrade Path Insights Engine
// Pure analytical module for evaluating PC platform longevity,
// power headroom, and future component upgradeability.
// ============================================================

function extractSocket(item) {
  if (!item) return null;
  if (item.socket) return String(item.socket).trim().toUpperCase();
  const raw = String(item.name || '');
  if (/AM5\b/i.test(raw)) return 'AM5';
  if (/AM4\b/i.test(raw)) return 'AM4';
  if (/LGA\s*1851|1851/i.test(raw)) return 'LGA1851';
  if (/LGA\s*1700|1700/i.test(raw)) return 'LGA1700';
  if (/LGA\s*1200|1200/i.test(raw)) return 'LGA1200';
  return null;
}

function extractPsuWattage(psu) {
  if (!psu) return null;
  if (psu.wattage != null && !isNaN(Number(psu.wattage))) return Number(psu.wattage);
  const raw = String(psu.name || psu.model || '');
  const m = raw.match(/(\d{3,4})\s*W/i);
  return m ? Number(m[1]) : null;
}

function extractTdp(item, fallback = 65) {
  if (!item) return 0;
  if (item.tdp != null && !isNaN(Number(item.tdp))) return Number(item.tdp);
  const raw = String(item.name || item.model || '');
  const m = raw.match(/(\d{2,3})\s*W/i);
  return m ? Number(m[1]) : fallback;
}

function analyzeUpgradePath(build = {}) {
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
    socketLongevity = 'แพลตฟอร์ม AM5 รองรับการอัปเกรด CPU AMD รุ่นใหม่ (Ryzen 9000 และรุ่นถัดไป) ได้ยาวถึงปี 2027+';
  } else if (socket === 'LGA1851') {
    platformScore = 8.5;
    socketLongevity = 'แพลตฟอร์ม LGA1851 ใหม่ล่าสุด รองรับตระกูล Intel Core Ultra';
  } else if (socket === 'AM4') {
    platformScore = 6;
    socketLongevity = 'แพลตฟอร์ม AM4 คุ้มค่าในงบประหยัด สิ้นสุดสายการผลิตหลักแล้ว อัปเกรดได้สูงสุดที่ตระกูล Ryzen 5000 / 5000X3D';
  } else if (socket === 'LGA1700') {
    platformScore = 6;
    socketLongevity = 'แพลตฟอร์ม Intel LGA1700 สิ้นสุดที่ Gen 14 สามารถอัปเกรดขยับไป Intel Core i7/i9 (Gen 13/14) ได้';
  }

  // Calculate estimated system power & PSU headroom
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
      powerText = `มีกำลังไฟสำรองสูง (~${headroomWatts}W) รองรับการอัปเกรดการ์ดจอระดับกลาง-สูงในอนาคตได้สบายโดยไม่ต้องเปลี่ยน PSU`;
    } else if (headroomWatts >= 100) {
      isGpuReady = false;
      isTight = false;
      powerText = `มีกำลังไฟสำรองปานกลาง (~${headroomWatts}W) เพียงพอกับสเปกปัจจุบัน หากอัปเกรดการ์ดจอที่กินไฟสูงขึ้นอาจต้องเปลี่ยน PSU`;
    } else {
      isGpuReady = false;
      isTight = true;
      powerText = `กำลังไฟสำรองเหลือน้อย (<100W) แนะนำเพิ่มขนาด PSU หากมีแผนอัปเกรดการ์ดจอในอนาคต`;
    }
  }

  // Calculate overall score
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
  if (isTight) tips.push('แนะนำเลือก PSU ขนาด 650W - 750W 80+ เพื่อความเสถียรและความยืดหยุ่นในการอัปเกรด');

  return {
    rating,
    score: totalScore,
    platform: {
      socket,
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
}

function formatUpgradeContext(build = {}) {
  const insight = analyzeUpgradePath(build);
  if (insight.rating === 'Unrated') return '';

  const parts = [
    `\n[การวิเคราะห์เส้นทางอัปเกรดในอนาคต (Upgrade Path Insights)]`,
    `- ระดับความยืดหยุ่นในการอัปเกรด: ${insight.rating} (${insight.score}/10 คะแนน)`,
    `- แพลตฟอร์มซ็อกเก็ต (${insight.platform.socket}): ${insight.platform.longevity}`,
  ];

  if (insight.power.psuWatts) {
    parts.push(`- กำลังไฟสำรอง (Power Headroom): มีกำลังไฟสำรอง ${insight.power.headroomWatts}W จาก PSU ${insight.power.psuWatts}W (ระบบใช้จริงประมาณ ${insight.power.estimatedTotalTdp}W). ${insight.power.description}`);
  }

  return parts.join('\n');
}

module.exports = {
  analyzeUpgradePath,
  formatUpgradeContext,
  extractSocket,
  extractPsuWattage,
  extractTdp,
};
