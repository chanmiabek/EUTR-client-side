export const ADMIN_SESSION_KEY = "eutr_admin_session";
export const ADMIN_SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

export const readStoredSession = () => {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;
    if (!session) return null;
    if (!session.expiresAt || Date.now() > session.expiresAt) {
      window.localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const writeStoredSession = (nextSession) => {
  if (nextSession) {
    window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(nextSession));
  } else {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  }
};
