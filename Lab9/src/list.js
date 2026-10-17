import { openDetails } from './details.js';
import { toggle } from './state.js';

const list = /** @type {HTMLUListElement} */ (document.querySelector('#results'));
const heading = /** @type {HTMLElement} */ (document.querySelector('#results-heading'));

/** Кнопка «До списку» картки з цим id або null, якщо картки на екрані немає. */
const toggleOf = (/** @type {string | undefined} */ id) =>
  id === undefined
    ? null
    : /** @type {HTMLButtonElement | null} */ (
        list.querySelector(`li[data-id="${id}"] [data-action="toggle"]`)
      );

/**
 * C2. Підключає кнопки карток у списку #results: «До списку» додає серіал до мого списку або
 * прибирає з нього, «Детальніше» відкриває діалог (openDetails з details.js). main.js викликає
 * цю функцію один раз, після першого показу списку. Специфікація — ТЗ, C2.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initList(refresh) {
  // Один обробник на весь список (event delegation): працює й для карток, створених після
  // перемальовування, і не дублюється.
  list.addEventListener('click', (event) => {
    // closest: клік по іконці <svg>/<path> усередині кнопки теж має знайти саму кнопку
    const button = /** @type {Element} */ (event.target).closest('button[data-action]');
    const card = button?.closest('li[data-id]');
    if (!button || !card || !list.contains(card)) return;

    // data-id — рядок, а функції state.js чекають число
    const id = Number(/** @type {HTMLElement} */ (card).dataset.id);

    if (button.getAttribute('data-action') === 'details') {
      openDetails(id);
      return;
    }

    // Сусіди запам'ятовуються до перемальовування: якщо картка зникне (фільтр «Лише мій
    // список»), фокус перейде на наступну картку, інакше на попередню, інакше на заголовок.
    const next = /** @type {HTMLElement | null} */ (card.nextElementSibling)?.dataset.id;
    const previous = /** @type {HTMLElement | null} */ (card.previousElementSibling)?.dataset.id;

    toggle(id);
    refresh();

    // Стару кнопку замінено новою, тож фокус переноситься одразу, без таймерів
    const target = toggleOf(String(id)) ?? toggleOf(next) ?? toggleOf(previous) ?? heading;
    target.focus();
  });
}
