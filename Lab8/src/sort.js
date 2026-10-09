/** @typedef {import('./normalize.js').Show} Show */

/**
 * C3. Повертає новий масив серіалів, відсортований за полем `key`.
 * Специфікація — ТЗ, C3.
 *
 * @param {Show[]} shows
 * @param {'name' | 'year' | 'rating'} key
 * @param {'asc' | 'desc'} [direction]
 * @returns {Show[]}
 */
export function sortShows(shows, key, direction = 'asc') {
  const sign = direction === 'desc' ? -1 : 1;

  // toSorted, а не sort: sort змінює вхідний масив (а замороженого — кидає TypeError)
  return shows.toSorted((a, b) => {
    const x = a[key];
    const y = b[key];

    // null — завжди в кінці, незалежно від напрямку
    if (x === null && y === null) return 0;
    if (x === null) return 1;
    if (y === null) return -1;

    // без компаратора sort порівнює рядки: [10, 9, 1] → [1, 10, 9]
    const order = typeof x === 'string' ? x.localeCompare(y) : x - y;
    // множимо на sign замість reverse(), щоб однакові значення зберегли вихідний порядок
    return order * sign;
  });
}
