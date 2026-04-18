export const ADMIN_SESSION_KEY = "eutr_admin_session";
export const ADMIN_SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

export const normalizeAdminSession = (session) => {
  if (!session || typeof session !== "object") return null;

  const token =
    session.token ||
    session.accessToken ||
    session.access_token ||
    session.access ||
    session.jwt ||
    session.authToken ||
    session?.data?.token ||
    session?.data?.accessToken ||
    session?.data?.access_token ||
    session?.data?.access ||
    "";

  const user = session.user || session.admin || session.profile || session?.data?.user || null;
  const expiresAt =
    Number(session.expiresAt) ||
    Number(session.expires_at) ||
    Number(session?.data?.expiresAt) ||
    Number(session?.data?.expires_at) ||
    0;

  if (!token) return null;

  return {
    ...session,
    token,
    user,
    expiresAt
  };
};

export const readStoredSession = () => {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    const session = normalizeAdminSession(raw ? JSON.parse(raw) : null);
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
  const normalizedSession = normalizeAdminSession(nextSession);

  if (normalizedSession) {
    window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(normalizedSession));
  } else {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  }
};
