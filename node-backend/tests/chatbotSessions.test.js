const {
  createChatbotSessionStore,
} = require('../services/chatbotSessions');

class ObservableMap extends Map {
  constructor() {
    super();
    this.fullScans = 0;
  }

  [Symbol.iterator]() {
    this.fullScans += 1;
    return super[Symbol.iterator]();
  }
}

describe('chatbot session store', () => {
  let currentTime;
  let nextId;
  let store;

  beforeEach(() => {
    currentTime = 1_000;
    nextId = 0;
    store = createChatbotSessionStore({
      ttlMs: 100,
      now: () => currentTime,
      randomUUID: () => `session-${++nextId}`,
    });
  });

  test('creates a server-owned session when no ID is provided', () => {
    expect(store.resolve('user-1')).toEqual({
      id: 'session-1',
      history: [],
    });
  });

  test('owner resolves the same session and receives the same history array', () => {
    const created = store.resolve('user-1');
    created.history.push({ role: 'user', text: 'hello' });

    const resolved = store.resolve('user-1', created.id);

    expect(resolved.id).toBe(created.id);
    expect(resolved.history).toBe(created.history);
  });

  test('foreign owner cannot resolve or clear a session', () => {
    const { id } = store.resolve('user-1');

    expect(() => store.resolve('user-2', id)).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND' }),
    );
    expect(() => store.clear('user-2', id)).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND' }),
    );

    expect(store.resolve('user-1', id).id).toBe(id);
  });

  test('expired session cannot be resolved', () => {
    const { id } = store.resolve('user-1');
    currentTime += 100;

    expect(() => store.resolve('user-1', id)).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND' }),
    );
  });

  test('unknown client-supplied ID is rejected rather than created', () => {
    expect(() => store.resolve('user-1', 'client-session')).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND' }),
    );

    expect(store.resolve('user-1').id).toBe('session-1');
  });

  test('empty client-supplied ID is rejected rather than created', () => {
    expect(() => store.resolve('user-1', '')).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND' }),
    );
  });

  test('owner clears their session, after which it is not found', () => {
    const { id } = store.resolve('user-1');

    expect(store.clear('user-1', id)).toBeUndefined();
    expect(() => store.resolve('user-1', id)).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND' }),
    );
  });

  test('successful resolve refreshes expiry', () => {
    const { id } = store.resolve('user-1');
    currentTime += 90;
    store.resolve('user-1', id);
    currentTime += 90;

    expect(store.resolve('user-1', id).id).toBe(id);
  });

  test('ordinary requests do not perform a full session scan', () => {
    const sessions = new ObservableMap();
    const observedStore = createChatbotSessionStore({
      ttlMs: 100,
      now: () => currentTime,
      randomUUID: () => `observed-${++nextId}`,
      sessions,
    });
    const { id } = observedStore.resolve('user-1');

    currentTime += 10;
    observedStore.resolve('user-1', id);
    currentTime += 10;
    observedStore.resolve('user-1', id);

    expect(sessions.has(id)).toBe(true);
    expect(sessions.fullScans).toBe(0);
  });

  test('scheduled sweep removes unrelated expired sessions', () => {
    const sessions = new ObservableMap();
    const observedStore = createChatbotSessionStore({
      ttlMs: 100,
      now: () => currentTime,
      randomUUID: () => `observed-${++nextId}`,
      sessions,
    });
    const stale = observedStore.resolve('user-1');
    const active = observedStore.resolve('user-1');

    currentTime += 90;
    observedStore.resolve('user-1', active.id);
    currentTime += 10;
    observedStore.resolve('user-1', active.id);

    expect(sessions.has(stale.id)).toBe(false);
    expect(sessions.has(active.id)).toBe(true);
    expect(sessions.fullScans).toBe(1);
  });

  test('requested expired session rejects before its scheduled sweep', () => {
    const sessions = new ObservableMap();
    const observedStore = createChatbotSessionStore({
      ttlMs: 100,
      cleanupIntervalMs: 1_000,
      now: () => currentTime,
      randomUUID: () => `observed-${++nextId}`,
      sessions,
    });
    const { id } = observedStore.resolve('user-1');
    currentTime += 100;

    expect(() => observedStore.resolve('user-1', id)).toThrow(
      expect.objectContaining({ code: 'SESSION_NOT_FOUND' }),
    );
    expect(sessions.has(id)).toBe(false);
    expect(sessions.fullScans).toBe(0);
  });
});
