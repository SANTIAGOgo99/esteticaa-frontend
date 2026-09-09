type SessionPayload = {
  id?: number | string;
  email?: string;
  role?: string;
};

const decodePayload = (token: string): SessionPayload | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as SessionPayload;
  } catch {
    return null;
  }
};

/**
 * Identificador estable de la sesión actual para separar cachés y datos locales
 * entre clientes que usan el mismo navegador.
 */
export const getSessionStorageId = (): string | null => {
  if (typeof window === 'undefined') return null;

  const token = window.localStorage.getItem('token');
  if (!token) return null;

  const payload = decodePayload(token);
  if (!payload) return null;

  if (payload.id !== undefined && payload.id !== null) {
    return `user-${String(payload.id)}`;
  }

  if (payload.email) {
    return `email-${payload.email.trim().toLowerCase()}`;
  }

  return null;
};
