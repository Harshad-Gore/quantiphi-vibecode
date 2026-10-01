const doFetch = globalThis.fetch ? globalThis.fetch.bind(globalThis) : require('node-fetch');
const { buildMockEvents } = require('../data/mockEvents');

// Normalise Ticketmaster discovery payload -> our Event DTO.
// ALL mapping/filtering/sorting logic lives here (server-side).
function normaliseTicketmaster(doc) {
  const venue = doc._embedded?.venues?.[0];
  return {
    id: doc.id,
    title: doc.name,
    venue: venue?.name || 'TBA',
    city: venue?.city?.name || '',
    startsAt: doc.dates?.start?.dateTime || null,
    genre: doc.classifications?.[0]?.segment?.name || 'Event',
    imageUrl: (doc.images || []).sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url || '',
    priceFrom: doc.priceRanges?.[0]?.min ?? null,
    currency: doc.priceRanges?.[0]?.currency || 'INR',
    url: doc.url,
    source: 'ticketmaster',
  };
}

async function fetchEvents({ keyword = '', city = '', startDate, endDate, size = 24, page = 0 }) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    let events = buildMockEvents();
    if (keyword) {
      const tokens = String(keyword).toLowerCase().split(/\s+/).filter(Boolean);
      events = events.filter((e) => {
        const hay = `${e.title} ${e.venue} ${e.genre}`.toLowerCase();
        return tokens.every((tok) => hay.includes(tok));
      });
    }
    if (city) {
      const c = city.toLowerCase();
      events = events.filter((e) => e.city.toLowerCase().includes(c));
    }
    if (startDate) events = events.filter((e) => new Date(e.startsAt) >= new Date(startDate));
    if (endDate) events = events.filter((e) => new Date(e.startsAt) <= new Date(endDate));
    events.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    return { events, total: events.length, page: 0, source: 'mock' };
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    size: String(Math.min(Number(size) || 24, 100)),
    page: String(page || 0),
    countryCode: process.env.TICKETMASTER_COUNTRY || 'IN',
    sort: 'date,asc',
  });
  if (keyword) params.set('keyword', keyword);
  if (city) params.set('city', city);
  if (startDate) params.set('startDateTime', new Date(startDate).toISOString().slice(0, 19) + 'Z');
  if (endDate) params.set('endDateTime', new Date(endDate).toISOString().slice(0, 19) + 'Z');

  const res = await doFetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`);
  if (!res.ok) throw new Error(`Ticketmaster upstream ${res.status}`);
  const json = await res.json();
  const docs = json._embedded?.events || [];
  return {
    events: docs.map(normaliseTicketmaster).filter((e) => e.startsAt),
    total: json.page?.totalElements ?? docs.length,
    page: json.page?.number ?? 0,
    source: 'ticketmaster',
  };
}

module.exports = { fetchEvents, normaliseTicketmaster };
