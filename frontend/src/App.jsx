import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import InviteLanding from './pages/InviteLanding';
import { useUser } from './lib/user';

function Shell() {
  const user = useUser();
  return (
    <div className="min-h-screen">
      <Header user={user} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/rsvps" element={<Dashboard user={user} />} />
        <Route path="/invite/:code" element={<InviteLanding />} />
      </Routes>
      <footer className="max-w-6xl mx-auto px-4 py-10 text-xs text-paper/40">
        VibeCheck · Ticketmaster feed + MongoDB persistence · all logic server-side · vibe counts update in realtime.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
