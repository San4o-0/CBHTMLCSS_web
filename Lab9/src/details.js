import { announce } from './render.js';
import { getShow, notes, saveNote } from './state.js';

const dialog = /** @type {HTMLDialogElement} */ (document.querySelector('#details'));
const title = /** @type {HTMLElement} */ (document.querySelector('#details-title'));
const summary = /** @type {HTMLElement} */ (document.querySelector('#details-summary'));
const link = /** @type {HTMLAnchorElement} */ (document.querySelector('#details-link'));
const form = /** @type {HTMLFormElement} */ (document.querySelector('#note-form'));
const rating = /** @type {HTMLInputElement} */ (form.elements.namedItem('rating'));
const text = /** @type {HTMLTextAreaElement} */ (form.elements.namedItem('note'));
const error = /** @type {HTMLElement} */ (document.querySelector('#note-rating-error'));
const list = /** @type {HTMLUListElement} */ (document.querySelector('#results'));
const heading = /** @type {HTMLElement} */ (document.querySelector('#results-heading'));

/** id серіалу, для якого зараз відкрито діалог. */
let currentId = 0;

/**
 * Опис TVmaze — HTML. Його розбирає DOMParser в інертному документі: скрипти й обробники там не
 * виконуються, зображення не завантажуються (на відміну від innerHTML навіть на <div> поза
 * сторінкою). На сторінку потрапляє лише текст кожного абзацу.
 */
function summaryParagraphs(/** @type {string} */ html) {
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

function showError(/** @type {string} */ message) {
  error.textContent = message;
  rating.setAttribute('aria-invalid', 'true');
}

function clearError() {
  error.textContent = '';
  rating.removeAttribute('aria-invalid');
}

/** Повідомлення про помилку оцінки або null, якщо оцінка правильна. */
function ratingProblem() {
  // valueAsNumber — число; для порожнього поля або нечислового введення — NaN
  const value = rating.valueAsNumber;
  if (rating.value === '' && !rating.validity.badInput) return 'Вкажіть оцінку від 1 до 10.';
  if (!Number.isInteger(value)) return 'Оцінка має бути цілим числом від 1 до 10.';
  if (value < 1 || value > 10) return 'Оцінка має бути від 1 до 10.';
  return null;
}

/** «Детальніше» картки поточного серіалу, а якщо картки на екрані немає — заголовок списку. */
function detailsButton() {
  return (
    /** @type {HTMLButtonElement | null} */ (
      list.querySelector(`li[data-id="${currentId}"] [data-action="details"]`)
    ) ?? heading
  );
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
  // replaceChildren замінює опис попереднього серіалу, а не дописує до нього
  summary.replaceChildren(...summaryParagraphs(show.summary));
  link.href = show.url;

  const note = notes.get(id);
  rating.value = note ? String(note.rating) : '';
  text.value = note?.text ?? '';
  clearError();

  // showModal: решта сторінки інертна, фокус переходить у діалог, Esc закриває,
  // а close() повертає фокус на кнопку «Детальніше», з якої діалог відкрито
  dialog.showModal();
}

/**
 * C4. Підключає діалог #details: закриття й форму «Моя оцінка й нотатка». main.js викликає цю
 * функцію один раз. Специфікація — ТЗ, C4.
 *
 * @param {() => void} refresh перемальовує список для поточних фільтрів
 */
export function initDetails(refresh) {
  // Перевіряємо самі: вбудована валідація показала б підказку браузера, але без aria-invalid і
  // без тексту помилки поруч із полем
  form.noValidate = true;
  rating.setAttribute('aria-describedby', error.id);

  const cancel = /** @type {HTMLButtonElement} */ (form.querySelector('button[type="button"]'));
  cancel.addEventListener('click', () => {
    dialog.close();
    detailsButton().focus();
  });

  // Щойно значення стало правильним, помилка зникає
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
    // картку перемальовано, тож фокус — на нову кнопку «Детальніше» цієї картки
    detailsButton().focus();
  });
}
