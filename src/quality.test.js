import { quality } from './quality.js';

const good = { title: 'Wireless Headphones', description: 'x'.repeat(60), thumbnail: 'a.png', price: 10, stock: 5 };

describe('quality', () => {
  it('scores a complete listing at 100', () => {
    expect(quality(good)).toMatchObject({ score: 100, level: 'good' });
  });
  it('lists the checks that failed', () => {
    const q = quality({ ...good, thumbnail: '', stock: 0 });
    expect(q.failed.map((c) => c.id)).toEqual(['image', 'stock']);
    expect(q.score).toBe(60);
  });
  it('rates an empty listing as bad', () => {
    expect(quality({}).level).toBe('bad');
  });
});
