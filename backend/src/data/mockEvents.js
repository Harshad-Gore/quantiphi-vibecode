// Deterministic mock catalogue used when TICKETMASTER_API_KEY is absent.
// Dates are generated relative to "now" so the calendar always lights up.
function buildMockEvents() {
  const now = new Date();
  const at = (dayOffset, hour) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  const seeds = [
    ['Neon Rooftop: Ritviz Live', 'Jio World Garden, BKC', 'Mumbai', 'Music', 3, 19],
    ['Underground Comedy: Late Night Mic', 'The Habitat, Khar', 'Mumbai', 'Comedy', 1, 20],
    ['Indie Film Premiere + Director Q&A', 'PVR IMAX, Andheri', 'Mumbai', 'Film', 4, 18],
    ['Street Food & Craft Beer Fest', 'Mahalaxmi Racecourse', 'Mumbai', 'Food', 6, 12],
    ['Lo-Fi Jazz & Vinyl Night', 'Blue Tokai, Kala Ghoda', 'Mumbai', 'Music', 8, 19],
    ['Sunburn Arena: Techno Bunker', 'NESCO Grounds, Goregaon', 'Mumbai', 'Music', 10, 21],
    ['Design Systems Workshop', 'Quantiphi Hall, Thane', 'Pune', 'Arts', 2, 10],
    ['Marathon: Midnight City Run 10K', 'Marine Drive', 'Mumbai', 'Sports', 5, 5],
    ['Sufi Night under the Stars', 'Amphitheatre, Delhi', 'Delhi', 'Music', 7, 19],
    ['AI Builders Meetup', 'Cowork Central, Bengaluru', 'Bengaluru', 'Tech', 9, 17],
  ];
  return seeds.map((s, i) => ({
    id: `mock-${i + 1}`,
    title: s[0],
    venue: s[1],
    city: s[2],
    startsAt: at(s[4], s[5]),
    genre: s[3],
    imageUrl: `https://picsum.photos/seed/vibe${i + 1}/640/360`,
    priceFrom: [499, 299, 799, 199][i % 4],
    currency: 'INR',
    url: 'https://www.ticketmaster.com',
    source: 'mock',
  }));
}

module.exports = { buildMockEvents };
