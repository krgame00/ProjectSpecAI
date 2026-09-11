const { getChatbotConfig } = require('../config/chatbotConfig');

function stripMarkup(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function normalizeTurn(turn) {
  if (!turn || typeof turn !== 'object') return null;
  const role = turn.role === 'user' ? 'user' : 'model';
  const text = stripMarkup(
    typeof turn.text === 'string'
      ? turn.text
      : Array.isArray(turn.parts)
        ? turn.parts.filter(part => typeof part?.text === 'string').map(part => part.text).join('\n')
        : ''
  );
  if (!text) return null;
  return { role, text };
}

function normalizeHistory(history = []) {
  return Array.isArray(history) ? history.map(normalizeTurn).filter(Boolean) : [];
}

function trimHistory(history, options = {}) {
  const config = getChatbotConfig();
  const maxMessages = options.maxMessages || config.history.maxMessages;
  const charBudget = options.charBudget || config.history.charBudget;
  const normalized = normalizeHistory(history);
  if (!normalized.length) return [];

  // Keep the latest two conversation pairs first, then backfill older turns.
  const selected = [];
  let total = 0;
  const addFromEnd = (turn) => {
    if (selected.length >= maxMessages || total + turn.text.length > charBudget) return false;
    selected.unshift(turn);
    total += turn.text.length;
    return true;
  };

  const priorityStart = Math.max(0, normalized.length - 4);
  for (let index = normalized.length - 1; index >= priorityStart; index -= 1) {
    addFromEnd(normalized[index]);
  }
  for (let index = priorityStart - 1; index >= 0; index -= 1) {
    if (!addFromEnd(normalized[index])) break;
  }
  return selected;
}

function toGeminiContents(history, currentText, extras = '') {
  const contents = trimHistory(history).map(turn => ({
    role: turn.role,
    parts: [{ text: turn.text }]
  }));
  const text = [currentText, extras].filter(Boolean).join('');
  if (text) contents.push({ role: 'user', parts: [{ text }] });

  const alternating = [];
  for (const item of contents) {
    const previous = alternating.at(-1);
    if (previous && previous.role === item.role) {
      previous.parts[0].text += `\n${item.parts[0].text}`;
    } else {
      alternating.push(item);
    }
  }
  return alternating;
}

function extractSessionFacts(text, previous = {}) {
  const source = String(text || '');
  const budgetMatch = source.match(/(?:งบ|budget)\s*(?:ไม่เกิน|ประมาณ|of|:)?\s*([\d,]+)\s*(?:บาท|thb|฿)?/i)
    || source.match(/([\d,]+)\s*(?:บาท|thb|฿)/i);
  const resolutionMatch = source.match(/(1080p|1440p|2k|4k|2160p)/i);
  const useCaseMatch = source.match(/(เล่นเกม|gaming|ทำงาน|ตัดต่อ|stream|สตรีม|เรนเดอร์|office)/i);
  const hardwareMatch = source.match(/\b(?:cpu|gpu|ram|ssd|psu|motherboard|เมนบอร์ด|การ์ดจอ|ซีพียู|แรม)\b/i);
  return {
    ...previous,
    ...(budgetMatch ? { budgetThb: Number(budgetMatch[1].replace(/,/g, '')) } : {}),
    ...(useCaseMatch ? { useCase: useCaseMatch[1] } : {}),
    ...(resolutionMatch ? { targetResolution: resolutionMatch[1].toLowerCase() } : {}),
    ...(hardwareMatch ? { currentHardwareTopic: hardwareMatch[0].toLowerCase() } : {})
  };
}

function prepareContext(input = {}, currentText = '', options = {}) {
  const objectInput = Array.isArray(input)
    ? { history: input, text: currentText, orderContext: options.orderContext || '', catalogContext: options.catalogContext || '' }
    : input;
  const history = objectInput.history || [];
  const text = objectInput.text || '';
  const orderContext = objectInput.orderContext || '';
  const catalogContext = objectInput.catalogContext || '';
  const trimmedHistory = trimHistory(history, options);
  return {
    history: trimmedHistory,
    facts: extractSessionFacts(text),
    contents: toGeminiContents(trimmedHistory, text, `${orderContext}${catalogContext}`)
  };
}

module.exports = {
  stripMarkup,
  normalizeHistory,
  trimHistory,
  toGeminiContents,
  extractSessionFacts,
  prepareContext
};
