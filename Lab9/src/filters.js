/** @typedef {import('./state.js').Filters} Filters */

const form = /** @type {HTMLFormElement} */ (document.querySelector('#filters'));
const query = /** @type {HTMLInputElement} */ (form.elements.namedItem('query'));
const genre = /** @type {HTMLSelectElement} */ (form.elements.namedItem('genre'));
const mine = /** @type {HTMLInputElement} */ (form.elements.namedItem('mine'));

/**
 * C3. Повертає поточні значення форми фільтрів #filters. Поки C3 не виконано, фільтрів немає,
 * і список показує всі серіали. Специфікація — ТЗ, C3.
 *
 * @returns {Filters}
 */
export function readFilters() {
  // trim і регістр враховує visibleShows() у state.js
  return { query: query.value, genre: genre.value, mine: mine.checked };
}

/**
 * C3. Підключає форму фільтрів: після кожної зміни — refresh(). main.js викликає цю функцію
 * один раз. Специфікація — ТЗ, C3.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initFilters(refresh) {
  // Пошук — під час введення; фокус лишається в полі, бо саме поле не перемальовується
  query.addEventListener('input', refresh);

  // Жанр і «Лише мій список» — одразу після зміни
  genre.addEventListener('change', refresh);
  mine.addEventListener('change', refresh);

  // Enter у полі пошуку надсилає форму: без preventDefault сторінка перезавантажилася б
  form.addEventListener('submit', (event) => event.preventDefault());

  // Подія reset настає ДО очищення полів, тож readFilters() в обробнику ще бачив би старі
  // значення. Тому поля очищуються тут же, а браузер після обробника лише повторить те саме.
  form.addEventListener('reset', () => {
    query.value = '';
    genre.value = '';
    mine.checked = false;
    refresh();
  });
}
