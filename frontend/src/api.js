const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Could not connect to the API at ${API_URL}. Check that the backend is running.`);
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details = payload.details?.map(({ field, message }) => {
      const label = field ? `${field}: ` : '';
      return `${label}${message}`;
    }).join(' ');

    const error = new Error(details || payload.error || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function saveSession({ token, user }) {
  localStorage.setItem('syntexchub-token', token);
  localStorage.setItem('syntexchub-user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('syntexchub-token');
  localStorage.removeItem('syntexchub-user');
}

export function readSession() {
  try {
    return {
      token: localStorage.getItem('syntexchub-token'),
      user: JSON.parse(localStorage.getItem('syntexchub-user') || 'null')
    };
  } catch {
    clearSession();
    return { token: null, user: null };
  }
}
