/** @typedef {import('./state.js').Show} Show */
import { notes, shows, watchlist } from './state.js';

const list = document.querySelector('#results');
const status = document.querySelector('#status');
const counter = document.querySelector('#watchlist-count');
const template = document.querySelector('#show-card');

const orDash = (value) =>
  value === null || value === undefined || value === '' ? '—' : String(value);

function fill(card, field, text) {
  for (const slot of card.querySelectorAll(`[data-field="${field}"]`)) slot.textContent = text;
}

function createCard(show) {
  const card = template.content.cloneNode(true).firstElementChild;
  card.dataset.id = String(show.id);

  fill(card, 'name', show.name);
  fill(card, 'year', orDash(show.year));
  fill(card, 'genres', orDash(show.genres.join(', ')));
  fill(card, 'rating', orDash(show.rating));

  const toggle = card.querySelector('[data-action="toggle"]');
  toggle.setAttribute('aria-pressed', String(watchlist.has(show.id)));

  const note = notes.get(show.id);
  const mine = card.querySelector('.card__mine');
  const noteText = card.querySelector('.card__note');
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
  list.replaceChildren(...items.map(createCard));
  status.textContent = items.length
    ? `Знайдено: ${items.length} з ${shows.length}`
    : 'Нічого не знайдено';
  counter.textContent = String(watchlist.size);
}

export function announce(message) {
  status.textContent = message;
}
