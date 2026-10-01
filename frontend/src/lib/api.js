const BASE = import.meta.env.VITE_API_URL || '';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `Request failed ${res.status}`);
  return res.json();
}

export const api = {
  health: () => req('/api/health'),
  events: (params = {}) => req(`/api/events?${new URLSearchParams(params)}`),
  vibe: (id) => req(`/api/events/${encodeURIComponent(id)}/vibe`),
  rsvp: (body) => req('/api/rsvps', { method: 'POST', body: JSON.stringify(body) }),
  myRsvps: (userId) => req(`/api/rsvps?userId=${encodeURIComponent(userId)}`),
  cancelRsvp: (id) => req(`/api/rsvps/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  ensureUser: (body) => req('/api/users/ensure', { method: 'POST', body: JSON.stringify(body) }),
  shareLink: (body) => req('/api/share-links', { method: 'POST', body: JSON.stringify(body) }),
  trackInvite: (code, eventId) =>
    req(`/api/share-links/${encodeURIComponent(code)}/track${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ''}`),
  chat: (message) => req('/api/chat', { method: 'POST', body: JSON.stringify({ message }) }),
  remind: (body) => req('/api/reminders', { method: 'POST', body: JSON.stringify(body) }),
};
