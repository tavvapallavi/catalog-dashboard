// Each check is one thing a catalog team would flag on a listing.
export const CHECKS = [
  { id: 'title', label: 'Title is at least 10 characters', test: (p) => (p.title || '').trim().length >= 10 },
  { id: 'desc', label: 'Description is at least 50 characters', test: (p) => (p.description || '').trim().length >= 50 },
  { id: 'image', label: 'Has an image', test: (p) => Boolean(p.thumbnail) },
  { id: 'price', label: 'Price is above 0', test: (p) => Number(p.price) > 0 },
  { id: 'stock', label: 'Is in stock', test: (p) => Number(p.stock) > 0 },
];

export function quality(p) {
  const failed = CHECKS.filter((c) => !c.test(p));
  const score = Math.round(((CHECKS.length - failed.length) / CHECKS.length) * 100);
  return { score, failed, level: score === 100 ? 'good' : score >= 60 ? 'ok' : 'bad' };
}
