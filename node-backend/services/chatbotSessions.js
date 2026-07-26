const { randomUUID } = require('crypto');

const DAY_MS = 24 * 60 * 60 * 1000;

function sessionNotFound() {
  const error = new Error('Chatbot session not found');
  error.code = 'SESSION_NOT_FOUND';
  return error;
}

function createChatbotSessionStore({ ttlMs, now, randomUUID: generateId }) {
  const sessions = new Map();

  function removeExpired() {
    const currentTime = now();

    for (const [id, session] of sessions) {
      if (currentTime - session.lastAccessedAt >= ttlMs) {
        sessions.delete(id);
      }
    }
  }

  function getOwnedSession(ownerId, sessionId) {
    const session = sessions.get(sessionId);

    if (!session || session.ownerId !== String(ownerId)) {
      throw sessionNotFound();
    }

    return session;
  }

  function create(ownerId) {
    let id;
    do {
      id = generateId();
    } while (sessions.has(id));

    const session = {
      ownerId: String(ownerId),
      history: [],
      lastAccessedAt: now(),
    };
    sessions.set(id, session);

    return { id, history: session.history };
  }

  return {
    resolve(ownerId, sessionId) {
      removeExpired();

      if (sessionId === undefined || sessionId === null || sessionId === '') {
        return create(ownerId);
      }

      const session = getOwnedSession(ownerId, sessionId);
      session.lastAccessedAt = now();
      return { id: sessionId, history: session.history };
    },

    clear(ownerId, sessionId) {
      removeExpired();
      getOwnedSession(ownerId, sessionId);
      sessions.delete(sessionId);
    },
  };
}

const chatbotSessions = createChatbotSessionStore({
  ttlMs: DAY_MS,
  now: Date.now,
  randomUUID,
});

module.exports = {
  createChatbotSessionStore,
  chatbotSessions,
};
