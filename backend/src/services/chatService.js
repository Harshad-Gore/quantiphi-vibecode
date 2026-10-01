// Server-side "intelligent" chat parser. Rule-based NLU: extracts city,
// date intent (tonight / weekend / next week), genre keyword and responds
// with matching events. All computation server-side; frontend only renders.
const { fetchEvents } = require('./ticketmaster');

const CITIES = ['mumbai', 'delhi', 'bengaluru', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'goa', 'jaipur'];
const GENRES = ['music', 'comedy', 'film', 'food', 'sports', 'tech', 'arts', 'jazz', 'techno', 'workshop', 'run', 'meetup'];

function parseIntent(text) {
  const t = String(text || '').toLowerCase();
  const city = CITIES.find((c) => t.includes(c));
  const genre = GENRES.find((g) => t.includes(g));
  let startDate = null;
  let endDate = null;
  const now = new Date();
  const atMidnight = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  if (/tonight|today/.test(t)) {
    startDate = atMidnight(now);
    endDate = new Date(atMidnight(now).getTime() + 24 * 3600e3);
  } else if (/tomorrow/.test(t)) {
    startDate = new Date(atMidnight(now).getTime() + 24 * 3600e3);
    endDate = new Date(startDate.getTime() + 24 * 3600e3);
  } else if (/weekend/.test(t)) {
    const day = now.getDay(); // 0 Sun..6 Sat
    const toSat = (6 - day + 7) % 7;
    startDate = new Date(atMidnight(now).getTime() + toSat * 24 * 3600e3);
    endDate = new Date(startDate.getTime() + 2 * 24 * 3600e3);
  } else if (/next week/.test(t)) {
    startDate = new Date(atMidnight(now).getTime() + 7 * 24 * 3600e3);
    endDate = new Date(startDate.getTime() + 7 * 24 * 3600e3);
  }
  // keyword = leftover meaningful words (strip stopwords); merged keyword dedupes genre overlap
  const stop = new Set(['show', 'me', 'find', 'any', 'events', 'event', 'in', 'at', 'on', 'for', 'this', 'the', 'a', 'an', 'please', 'tonight', 'today', 'tomorrow', 'weekend', 'week', 'next', 'near', 'around']);
  const words = t
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !stop.has(w) && !CITIES.includes(w) && w.length > 2)
    .slice(0, 3);
  const keyword = words.join(' ');
  const merged = [...new Set([...words, ...(genre ? [genre] : [])])].join(' ');
  return { city, genre, startDate, endDate, keyword, keywordMerged: merged };
}

async function chatReply(message, scope = 'india') {
  const intent = parseIntent(message);
  const cityMap = { bangalore: 'Bengaluru' };
  const worldwide = scope === 'worldwide';
  // Worldwide mode drops the city pin (same rule as the feed: a city pin
  // without a country pin yields nothing for Indian cities on Ticketmaster).
  const city = worldwide ? '' : cityMap[intent.city] || (intent.city ? intent.city[0].toUpperCase() + intent.city.slice(1) : '');
  let { events, source } = await fetchEvents({
    keyword: intent.keywordMerged,
    city,
    startDate: intent.startDate?.toISOString(),
    endDate: intent.endDate?.toISOString(),
    size: 6,
    scope,
  });
  let softened = false;
  if (!events.length && (intent.startDate || intent.endDate)) {
    // Soften: keep keyword+city, drop the date window so the user still gets useful picks.
    const retry = await fetchEvents({ keyword: intent.keywordMerged, city, size: 6, scope });
    if (retry.events.length) {
      events = retry.events;
      source = retry.source;
      softened = true;
    }
  }
  const when = intent.startDate
    ? ` for ${intent.startDate.toDateString().slice(0, 10)}`
    : '';
  const where = city ? ` in ${city}` : '';
  const text = events.length
    ? `Found ${events.length} event${events.length > 1 ? 's' : ''}${where}${softened ? '' : when} — top pick: "${events[0].title}" at ${events[0].venue}.${softened ? ' Nothing on that exact date, so here is the closest match.' : ''}`
    : `No events matched${where}${when}. Try "comedy this weekend" or "music in Mumbai".`;
  return { text, intent: { ...intent, city }, events, source };
}

module.exports = { parseIntent, chatReply };
