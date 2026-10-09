/** @typedef {import('./normalize.js').Show} Show */

/**
 * @typedef {object} GenreStats
 * @property {number} count скільки серіалів мають цей жанр
 * @property {number | null} averageRating середня оцінка цих серіалів
 */

/**
 * C4. Рахує статистику для кожного жанру.
 * Специфікація — ТЗ, C4.
 *
 * @param {Show[]} shows
 * @returns {Record<string, GenreStats>} ключ — назва жанру
 */
export function genreStats(shows) {
  // Map як проміжний словник: жанр → { count, sum, rated }
  const totals = new Map();

  for (const show of shows) {
    for (const genre of show.genres) {
      const entry = totals.get(genre) ?? { count: 0, sum: 0, rated: 0 };
      entry.count += 1;
      // null не входить у середнє, а 0 — входить, тому !== null, а не if (show.rating)
      if (show.rating !== null) {
        entry.sum += show.rating;
        entry.rated += 1;
      }
      totals.set(genre, entry);
    }
  }

  const result = {};
  for (const [genre, { count, sum, rated }] of totals) {
    // без оцінок sum / rated дало б NaN (0 / 0); округлення прибирає хвости на кшталт 8.200000000000001
    const averageRating = rated === 0 ? null : Math.round((sum / rated) * 10) / 10;
    result[genre] = { count, averageRating };
  }
  return result;
}
