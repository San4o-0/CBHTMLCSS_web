/** @typedef {import('./state.js').Filters} Filters */

const form = document.querySelector('#filters');
const query = form.elements.namedItem('query');
const genre = form.elements.namedItem('genre');
const mine = form.elements.namedItem('mine');

/**
 * C3. Повертає поточні значення форми фільтрів #filters. Поки C3 не виконано, фільтрів немає,
 * і список показує всі серіали. Специфікація — ТЗ, C3.
 *
 * @returns {Filters}
 */
export function readFilters() {
  return { query: query.value, genre: genre.value, mine: mine.checked };
}

/**
 * C3. Підключає форму фільтрів: після кожної зміни — refresh(). main.js викликає цю функцію
 * один раз. Специфікація — ТЗ, C3.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initFilters(refresh) {
  query.addEventListener('input', refresh);
  genre.addEventListener('change', refresh);
  mine.addEventListener('change', refresh);

  form.addEventListener('submit', (event) => event.preventDefault());

  form.addEventListener('reset', () => {
    query.value = '';
    genre.value = '';
    mine.checked = false;
    refresh();
  });
}
