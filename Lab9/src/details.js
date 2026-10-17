import { announce } from './render.js';
import { getShow, notes, saveNote } from './state.js';

const dialog = document.querySelector('#details');
const title = document.querySelector('#details-title');
const summary = document.querySelector('#details-summary');
const link = document.querySelector('#details-link');
const form = document.querySelector('#note-form');
const rating = form.elements.namedItem('rating');
const text = form.elements.namedItem('note');
const error = document.querySelector('#note-rating-error');
const list = document.querySelector('#results');
const heading = document.querySelector('#results-heading');

let currentId = 0;

function summaryParagraphs(html) {
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  return [...body.childNodes]
    .map((node) => (node.textContent ?? '').trim())
    .filter(Boolean)
    .map((paragraph) => {
      const p = document.createElement('p');
      p.textContent = paragraph;
      return p;
    });
}

function showError(message) {
  error.textContent = message;
  rating.setAttribute('aria-invalid', 'true');
}

function clearError() {
  error.textContent = '';
  rating.removeAttribute('aria-invalid');
}

function ratingProblem() {
  const value = rating.valueAsNumber;
  if (rating.value === '' && !rating.validity.badInput) return 'Вкажіть оцінку від 1 до 10.';
  if (!Number.isInteger(value)) return 'Оцінка має бути цілим числом від 1 до 10.';
  if (value < 1 || value > 10) return 'Оцінка має бути від 1 до 10.';
  return null;
}

function detailsButton() {
  return list.querySelector(`li[data-id="${currentId}"] [data-action="details"]`) ?? heading;
}

/**
 * C4. Відкриває діалог #details для серіалу: назва, опис, посилання на сторінку TVmaze і форма
 * з моєю оцінкою й нотаткою. Специфікація — ТЗ, C4.
 *
 * @param {number} id
 */
export function openDetails(id) {
  const show = getShow(id);
  currentId = id;

  title.textContent = show.name;
  summary.replaceChildren(...summaryParagraphs(show.summary));
  link.href = show.url;

  const note = notes.get(id);
  rating.value = note ? String(note.rating) : '';
  text.value = note?.text ?? '';
  clearError();

  dialog.showModal();
}

/**
 * C4. Підключає діалог #details: закриття й форму «Моя оцінка й нотатка». main.js викликає цю
 * функцію один раз. Специфікація — ТЗ, C4.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initDetails(refresh) {
  form.noValidate = true;
  rating.setAttribute('aria-describedby', error.id);

  const cancel = form.querySelector('button[type="button"]');
  cancel.addEventListener('click', () => {
    dialog.close();
    detailsButton().focus();
  });

  rating.addEventListener('input', () => {
    if (rating.hasAttribute('aria-invalid') && !ratingProblem()) clearError();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const problem = ratingProblem();
    if (problem) {
      showError(problem);
      rating.focus();
      return;
    }

    saveNote(currentId, { rating: rating.valueAsNumber, text: text.value.trim() });
    dialog.close();
    refresh();
    announce(`Нотатку до ${getShow(currentId).name} збережено`);
    detailsButton().focus();
  });
}
