const { randomUUID } = require('crypto');

const DAY_MS = 24 * 60 * 60 * 1000;

function sessionNotFound() {
  const error = new Error('Chatbot session not found');
  error.code = 'SESSION_NOT_FOUND';
  return error;
}

function createChatbotSessionStore({
  ttlMs,
  now,
  randomUUID: generateId,
  cleanupIntervalMs = ttlMs,
  sessions = new Map(),
}) {
  let nextSweepAt = now() + cleanupIntervalMs;

  function isExpired(session, currentTime) {
    return currentTime - session.lastAccessedAt >= ttlMs;
  }

  function removeExpiredWhenDue(currentTime) {
    if (currentTime < nextSweepAt) {
      return;
    }

    for (const [id, session] of sessions) {
      if (isExpired(session, currentTime)) {
        sessions.delete(id);
      }
    }

    nextSweepAt = currentTime + cleanupIntervalMs;
  }

  function getOwnedSession(ownerId, sessionId, currentTime) {
    const session = sessions.get(sessionId);

    if (!session || isExpired(session, currentTime)) {
      sessions.delete(sessionId);
      throw sessionNotFound();
    }

    if (session.ownerId !== String(ownerId)) {
      throw sessionNotFound();
    }

    return session;
  }

  function create(ownerId, currentTime) {
    let id;
    do {
      id = generateId();
    } while (sessions.has(id));

    const session = {
      ownerId: String(ownerId),
      history: [],
      lastAccessedAt: currentTime,
    };
    sessions.set(id, session);

    return { id, history: session.history };
  }

  return {
    resolve(ownerId, sessionId) {
      const currentTime = now();
      removeExpiredWhenDue(currentTime);

      if (sessionId === undefined || sessionId === null) {
        return create(ownerId, currentTime);
      }

      const session = getOwnedSession(ownerId, sessionId, currentTime);
      session.lastAccessedAt = currentTime;
      return { id: sessionId, history: session.history };
    },

    clear(ownerId, sessionId) {
      const currentTime = now();
      removeExpiredWhenDue(currentTime);
      getOwnedSession(ownerId, sessionId, currentTime);
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
