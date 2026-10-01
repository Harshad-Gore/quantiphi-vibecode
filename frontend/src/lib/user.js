import { useEffect, useState } from 'react';
import { api } from './api';

// Demo identity: deterministic per browser, ensured server-side.
// Retries until the backend answers — never settles for a fake id, so a page
// that loaded while the API was down heals itself instead of poisoning
// follow-up calls (RSVPs, dashboard) with an unusable user id.
export function useUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let alive = true;
    let timer = null;
    const key = 'vibe-user-email';
    let email = localStorage.getItem(key);
    if (!email) {
      email = `fan${Math.floor(Math.random() * 9000 + 1000)}@vibecheck.local`;
      localStorage.setItem(key, email);
    }
    const attempt = async () => {
      try {
        const u = await api.ensureUser({ name: email.split('@')[0], email, city: 'Mumbai' });
        if (alive) setUser(u);
      } catch {
        if (alive) timer = setTimeout(attempt, 3000);
      }
    };
    attempt();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);
  return user;
}
