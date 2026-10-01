import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';

// Floating concierge: sends natural language to POST /api/chat (server-side NLU).
export default function ChatWidget({ onPick }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from: 'assistant', text: 'Hey! Tell me what kind of night you want — e.g. “comedy this weekend in Mumbai”.' }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const s = getSocket();
    const onMsg = (m) => setMsgs((prev) => [...prev, m]);
    s.on('chat:message', onMsg);
    return () => s.off('chat:message', onMsg);
  }, []);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [msgs, open]);

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    setMsgs((p) => [...p, { from: 'user', text }]);
    setBusy(true);
    try {
      const reply = await api.chat(text);
      setMsgs((p) => [...p, { from: 'assistant', text: reply.text }]);
      if (reply.events?.length) onPick?.(reply.events);
    } catch {
      setMsgs((p) => [...p, { from: 'assistant', text: 'Something hiccuped. Try “music in Mumbai”.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 w-[min(92vw,360px)]">
      {open && (
        <div className="mb-2 rounded-2xl overflow-hidden border border-white/10 bg-inksoft shadow-2xl">
          <div className="px-4 py-3 bg-vibepink text-white font-display font-bold text-sm">Vibe concierge</div>
          <div ref={boxRef} className="h-64 overflow-y-auto p-3 space-y-2 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.from === 'user' ? 'ml-auto bg-poster text-ink' : 'bg-white/10 text-paper'}`}>{m.text}</div>
            ))}
            {busy && <div className="text-xs text-paper/50">Finding events…</div>}
          </div>
          <form onSubmit={send} className="flex gap-2 p-2 border-t border-white/10">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Try: jazz tonight" className="flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm placeholder:text-paper/40" />
            <button className="rounded-xl bg-poster text-ink px-3 py-2 text-sm font-semibold">Send</button>
          </form>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="ml-auto flex rounded-full bg-poster text-ink font-display font-bold px-5 py-3 shadow-2xl hover:brightness-105">
        {open ? 'Close chat' : 'Ask the concierge'}
      </button>
    </div>
  );
}
