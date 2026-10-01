import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

// Landing page for /invite/:code — tracks the click server-side, then shows live vibe.
export default function InviteLanding() {
  const { code } = useParams();
  const [search] = useSearchParams();
  const [state, setState] = useState({ status: 'tracking' });

  useEffect(() => {
    api.trackInvite(code, search.get('eventId'))
      .then((r) => setState({ status: 'ok', ...r }))
      .catch((e) => setState({ status: 'error', error: e.message }));
  }, [code, search]);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <p className="font-display font-extrabold text-4xl">You’re invited.</p>
      {state.status === 'tracking' && <p className="mt-3 text-paper/60">Counting your vibe…</p>}
      {state.status === 'ok' && (
        <div className="mt-4 bg-paper text-ink rounded-2xl p-6">
          <p className="text-sm text-ink/60">Invite code</p>
          <p className="font-mono font-bold break-all">{state.code}</p>
          <p className="mt-3 font-display font-bold text-2xl">{state.vibe?.friendsAttending ?? 1} friends attending</p>
          <p className="text-xs text-ink/60">{state.vibe?.rsvpCount ?? 0} RSVPs · {state.vibe?.clickCount ?? 0} invite taps</p>
          <Link to="/" className="inline-block mt-5 rounded-xl bg-ink text-paper px-4 py-2 text-sm font-semibold">Find the event & RSVP</Link>
        </div>
      )}
      {state.status === 'error' && (
        <div className="mt-4">
          <p className="text-vibepink text-sm">That invite link looks expired: {state.error}</p>
          <Link to="/" className="underline text-poster text-sm">Back to events</Link>
        </div>
      )}
    </div>
  );
}
