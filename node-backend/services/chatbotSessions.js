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
  onSweep,
}) {
  const sessions = new Map();
  let nextSweepAt = now() + cleanupIntervalMs;

  function publicSession(id, session) {
    const result = { id, history: session.history };
    // Keep the original public shape while exposing server-owned state to
    // the chatbot route without allowing callers to replace the references.
    Object.defineProperties(result, {
      facts: { value: session.facts, enumerable: false },
      recentFastResponses: { value: session.recentFastResponses, enumerable: false },
    });
    return result;
  }

  function isExpired(session, currentTime) {
    return currentTime - session.lastAccessedAt >= ttlMs;
  }

  function removeExpiredWhenDue(currentTime) {
    if (currentTime < nextSweepAt) {
      return;
    }

    let scanned = 0;
    let deleted = 0;

    for (const [id, session] of sessions) {
      scanned += 1;
      if (isExpired(session, currentTime)) {
        sessions.delete(id);
        deleted += 1;
      }
    }

    nextSweepAt = currentTime + cleanupIntervalMs;
    if (onSweep) {
      onSweep({ scanned, deleted });
    }
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
      facts: {},
      recentFastResponses: [],
      lastAccessedAt: currentTime,
    };
    sessions.set(id, session);

    return publicSession(id, session);
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
      return publicSession(sessionId, session);
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
