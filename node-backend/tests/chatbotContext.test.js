const { trimHistory, prepareContext, extractSessionFacts } = require('../services/chatbotContext');

describe('chatbot context budget', () => {
  test('keeps at most 12 messages and 12,000 history characters', () => {
    const history = Array.from({ length: 20 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', text: `${index}-`.repeat(1000) }));
    const trimmed = trimHistory(history);
    expect(trimmed.length).toBeLessThanOrEqual(12);
    expect(trimmed.reduce((total, turn) => total + turn.text.length, 0)).toBeLessThanOrEqual(12000);
    expect(trimmed.at(-1).text).toContain('19-');
  });

  test('maps legacy history and extracts persistent session facts', () => {
    const context = prepareContext({ history: [{ role: 'user', text: '<b>hello</b>' }], text: 'งบ 35,000 บาท เล่นเกม 1440p' });
    expect(context.contents.at(-1).parts[0].text).toContain('งบ 35,000');
    expect(extractSessionFacts('งบ 35,000 บาท เล่นเกม 1440p')).toMatchObject({ budgetThb: 35000, targetResolution: '1440p' });
  });

  test('skips oversized turns while backfilling smaller history', () => {
    const trimmed = trimHistory([
      { role: 'user', text: 'old'.repeat(1000) },
      { role: 'assistant', text: 'x'.repeat(13000) },
      { role: 'user', text: 'new'.repeat(1000) },
    ]);
    expect(trimmed.reduce((total, turn) => total + turn.text.length, 0)).toBeLessThanOrEqual(12000);
    expect(trimmed.map(turn => turn.text)).toEqual(expect.arrayContaining(['old'.repeat(1000), 'new'.repeat(1000)]));
  });
});
