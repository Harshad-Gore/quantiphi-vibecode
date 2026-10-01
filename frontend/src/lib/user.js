import { useEffect, useState } from 'react';
import { api } from './api';

// Demo identity: deterministic per browser, ensured server-side.
export function useUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const key = 'vibe-user-email';
    let email = localStorage.getItem(key);
    if (!email) {
      email = `fan${Math.floor(Math.random() * 9000 + 1000)}@vibecheck.local`;
      localStorage.setItem(key, email);
    }
    api.ensureUser({ name: email.split('@')[0], email, city: 'Mumbai' })
      .then(setUser)
      .catch(() => setUser({ _id: email, name: email.split('@')[0], email }));
  }, []);
  return user;
}
