import { openDetails } from './details.js';
import { toggle } from './state.js';

const list = document.querySelector('#results');
const heading = document.querySelector('#results-heading');

const toggleOf = (id) =>
  id === undefined ? null : list.querySelector(`li[data-id="${id}"] [data-action="toggle"]`);

/**
 * C2. Підключає кнопки карток у списку #results: «До списку» додає серіал до мого списку або
 * прибирає з нього, «Детальніше» відкриває діалог (openDetails з details.js). main.js викликає
 * цю функцію один раз, після першого показу списку. Специфікація — ТЗ, C2.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initList(refresh) {
  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    const card = button?.closest('li[data-id]');
    if (!button || !card || !list.contains(card)) return;

    const id = Number(card.dataset.id);

    if (button.getAttribute('data-action') === 'details') {
      openDetails(id);
      return;
    }

    const next = card.nextElementSibling?.dataset.id;
    const previous = card.previousElementSibling?.dataset.id;

    toggle(id);
    refresh();

    const target = toggleOf(String(id)) ?? toggleOf(next) ?? toggleOf(previous) ?? heading;
    target.focus();
  });
}
