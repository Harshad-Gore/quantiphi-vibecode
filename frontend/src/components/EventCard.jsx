import { useState } from 'react';
import { api } from '../lib/api';

// Ticket-stub event card. Renders server-computed vibe counts; all writes go to the API.
export default function EventCard({ event, user, rsvpd, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const vibe = event.vibe || {};
  const friends = vibe.friendsAttending ?? vibe.rsvpCount ?? 0;
  const when = event.startsAt ? new Date(event.startsAt) : null;

  const doRsvp = async () => {
    if (!user) return;
    setBusy(true);
    try {
      await api.rsvp({
        userId: user._id, eventId: event.id, eventTitle: event.title,
        venue: event.venue, city: event.city, startsAt: event.startsAt,
        imageUrl: event.imageUrl, genre: event.genre,
      });
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  const doShare = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const r = await api.shareLink({ userId: user._id, eventId: event.id });
      setShareUrl(r.url);
      await navigator.clipboard?.writeText(r.url).catch(() => {});
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="group relative bg-paper text-ink rounded-2xl overflow-hidden flex flex-col">
      <div className="relative h-36 bg-inksoft">
        {event.imageUrl && <img src={event.imageUrl} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="h-full w-full object-cover" />}
        <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-full bg-ink/80 text-poster">{event.genre}</span>
        <span className="absolute top-2 right-2 text-[11px] font-semibold px-2 py-1 rounded-full bg-poster text-ink">
          {friends} friends attending
        </span>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="font-display font-bold leading-snug">{event.title}</h3>
        <p className="text-sm text-ink/70">{event.venue}{event.city ? ` · ${event.city}` : ''}</p>
        <p className="text-sm font-medium">{when ? when.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Date TBA'}</p>
        <div className="mt-3 flex gap-2">
          <button disabled={busy || rsvpd} onClick={doRsvp} className={`flex-1 rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-semibold cursor-pointer transition-colors ${rsvpd ? 'bg-vipteal/30 text-ink/60' : 'bg-ink text-paper hover:bg-black'}`}>
            {rsvpd ? 'RSVP’d ✓' : busy ? 'Saving…' : 'Interested / RSVP'}
          </button>
          <button disabled={busy} onClick={doShare} title="Generate a share link to invite friends" className="rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-semibold bg-vibepink text-white hover:brightness-110 cursor-pointer transition">
            Invite
          </button>
        </div>
        {shareUrl && (
          <p className="mt-2 text-xs break-all bg-ink/5 rounded-lg p-2">
            Share link ready (copied): <a className="underline" href={shareUrl}>{shareUrl}</a>
          </p>
        )}
      </div>
      <div aria-hidden className="h-2 bg-[radial-gradient(circle_at_8px_-2px,transparent_8px,#14101F_8.5px)] bg-[length:20px_8px]" />
    </article>
  );
}
