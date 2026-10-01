import { Link, useLocation } from 'react-router-dom';

export default function Header({ user }) {
  const { pathname } = useLocation();
  const link = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
        pathname === to ? 'bg-poster text-ink' : 'text-paper/70 hover:text-paper hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-ink/85 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="font-display font-extrabold text-lg tracking-tight">
          Vibe<span className="text-poster">Check</span>
        </Link>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-vibepink/15 text-vibepink border border-vibepink/30">
          live
        </span>
        <nav className="ml-4 flex gap-1">
          {link('/', 'Discover')}
          {link('/rsvps', 'My RSVPs')}
        </nav>
        <div className="ml-auto text-xs text-paper/60">
          {user ? `Signed in as ${user.name}` : 'Signing in…'}
        </div>
      </div>
      <div className="overflow-hidden border-t border-white/10 bg-poster text-ink">
        <div className="marquee whitespace-nowrap py-1 text-xs font-semibold font-display">
          {Array(8).fill('  Find your night out — RSVP — invite friends — watch the vibe climb  ✦ ').join('')}
        </div>
      </div>
    </header>
  );
}
