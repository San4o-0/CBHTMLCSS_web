/** @typedef {import('./state.js').Show} Show */
import { notes, shows, watchlist } from './state.js';

const list = /** @type {HTMLUListElement} */ (document.querySelector('#results'));
const status = /** @type {HTMLElement} */ (document.querySelector('#status'));
const counter = /** @type {HTMLElement} */ (document.querySelector('#watchlist-count'));
const template = /** @type {HTMLTemplateElement} */ (document.querySelector('#show-card'));

/** Значення або «—», щоб на картці ніколи не було null, undefined чи NaN. */
const orDash = (/** @type {unknown} */ value) =>
  value === null || value === undefined || value === '' ? '—' : String(value);

/**
 * Записує текст у всі елементи картки з data-field="…". Лише textContent: розмітка в даних
 * залишається текстом.
 */
function fill(
  /** @type {Element} */ card,
  /** @type {string} */ field,
  /** @type {string} */ text,
) {
  for (const slot of card.querySelectorAll(`[data-field="${field}"]`)) slot.textContent = text;
}

/** Картка серіалу — клон шаблону #show-card. */
function createCard(/** @type {Show} */ show) {
  const fragment = /** @type {DocumentFragment} */ (template.content.cloneNode(true));
  const card = /** @type {HTMLLIElement} */ (fragment.firstElementChild);
  card.dataset.id = String(show.id);

  fill(card, 'name', show.name);
  fill(card, 'year', orDash(show.year));
  fill(card, 'genres', orDash(show.genres.join(', ')));
  fill(card, 'rating', orDash(show.rating));

  const toggle = /** @type {HTMLButtonElement} */ (card.querySelector('[data-action="toggle"]'));
  toggle.setAttribute('aria-pressed', String(watchlist.has(show.id)));

  const note = notes.get(show.id);
  const mine = /** @type {HTMLElement} */ (card.querySelector('.card__mine'));
  const noteText = /** @type {HTMLElement} */ (card.querySelector('.card__note'));
  if (note) {
    fill(card, 'my-rating', String(note.rating));
    mine.hidden = false;
    noteText.textContent = note.text;
    noteText.hidden = note.text === '';
  }
  return card;
}

/**
 * C1. Показує серіали в списку #results — по картці з шаблону #show-card на кожен, у тому
 * самому порядку, — і оновлює рядок статусу #status. Специфікація — ТЗ, C1.
 *
 * @param {readonly Show[]} items серіали, які треба показати
 */
export function renderShows(items) {
  // replaceChildren замінює всі старі картки одним викликом — без циклу по live-колекції
  list.replaceChildren(...items.map(createCard));
  // змінюється лише текст наявного live region, сам елемент #status лишається тим самим
  status.textContent = items.length
    ? `Знайдено: ${items.length} з ${shows.length}`
    : 'Нічого не знайдено';
  counter.textContent = String(watchlist.size);
}

/** Повідомлення в рядку статусу, наприклад після збереження нотатки. */
export function announce(/** @type {string} */ message) {
  status.textContent = message;
}
