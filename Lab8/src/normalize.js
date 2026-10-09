/**
 * @typedef {object} RawShow Запис із `data/shows.json` у форматі TVmaze.
 * @property {number} id
 * @property {string} name
 * @property {string[]} [genres]
 * @property {number | null} [runtime] тривалість серії, хв
 * @property {string | null} [premiered] дата прем'єри, "YYYY-MM-DD"
 * @property {{ average: number | null } | null} [rating]
 * @property {{ id: number, name: string } | null} [network]
 */

/**
 * @typedef {object} Show Серіал після normalizeShow() — з таким форматом працюють C2–C4.
 * @property {number} id
 * @property {string} name
 * @property {number | null} year рік прем'єри
 * @property {number | null} rating середня оцінка глядачів
 * @property {number | null} runtime тривалість серії, хв
 * @property {string | null} network назва телемережі
 * @property {string[]} genres
 */

/**
 * C1. Перетворює запис TVmaze на {@link Show}.
 * Специфікація — ТЗ, C1.
 *
 * @param {RawShow} raw
 * @returns {Show}
 */
export function normalizeShow(raw) {
  // "2008-01-20" → 2008; без дати — null, бо Number(null) дає 0, а new Date(null) — 1970
  const year = raw.premiered ? Number(raw.premiered.slice(0, 4)) : null;

  return {
    id: raw.id,
    name: raw.name,
    year,
    // ?? замість ||: оцінка 0 — це значення, а не його відсутність
    rating: raw.rating?.average ?? null,
    runtime: raw.runtime ?? null,
    network: raw.network?.name ?? null,
    // копія масиву, щоб результат не ділив посилання з вхідними даними
    genres: [...(raw.genres ?? [])],
  };
}
