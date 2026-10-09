/** @typedef {import('./normalize.js').Show} Show */

/**
 * @typedef {object} FilterOptions
 * @property {string | null} [query] частина назви
 * @property {string | null} [genre] жанр
 * @property {number | null} [minRating] мінімальна оцінка
 */

/**
 * C2. Повертає серіали, які відповідають усім заданим фільтрам.
 * Специфікація — ТЗ, C2.
 *
 * @param {Show[]} shows
 * @param {FilterOptions} [options]
 * @returns {Show[]}
 */
export function filterShows(shows, { query = null, genre = null, minRating = null } = {}) {
  // значення за замовчуванням не спрацьовує для null, тому ?? '' ще й тут
  const needle = (query ?? '').trim().toLowerCase();
  const wantedGenre = (genre ?? '').trim();

  return shows.filter((show) => {
    if (needle && !show.name.toLowerCase().includes(needle)) return false;
    if (wantedGenre && !show.genres.includes(wantedGenre)) return false;
    // minRating 0 / null — «без фільтра»; інакше null відкидаємо явно, бо null >= 0 — true
    if (minRating && (show.rating === null || show.rating < minRating)) return false;
    return true;
  });
}
