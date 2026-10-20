/**
 * Поведінка ShowFinder: пошук (C1), сторінка серіалу (C2), помилки й повторні спроби (C3).
 * Тут — обробники подій, життєвий цикл кожного запиту й стани областей #results і #details:
 * завантаження, результат, порожній результат, помилка. Специфікація — ТЗ, §3–4.
 */
import { ApiError, getShow, searchShows } from './api.js';
import { renderResults, renderShow } from './view.js';

const form = document.querySelector('#search');
const input = document.querySelector('#search-query');
const status = document.querySelector('#status');
const results = document.querySelector('#results');

const DEBOUNCE_MS = 300;
const MIN_LENGTH = 2;

function showTemplate(container, id, text) {
  const node = document.querySelector(id).content.cloneNode(true);
  if (text) node.querySelector('.state, .state__text').textContent = text;
  container.replaceChildren(node);
}

/** Текст помилки для користувача. */
function errorMessage(error) {
  if (error instanceof ApiError) {
    if (error.status === 404) return 'Серіал не знайдено';
    if (error.status === 429) return 'Забагато запитів. Спробуйте за хвилину.';
    return `Помилка сервера TVmaze (${error.status}). Спробуйте пізніше.`;
  }
  if (error instanceof TypeError) return "Немає з'єднання з інтернетом.";
  return `Сталася помилка: ${error.message}`;
}

/** Показує помилку з кнопкою «Спробувати ще», яка повторює retry(). */
function showError(container, error, retry) {
  showTemplate(container, '#state-error', errorMessage(error));
  container.querySelector('[data-action="retry"]').addEventListener('click', retry);
}

let timer;
let searchController;

async function runSearch() {
  clearTimeout(timer);
  searchController?.abort();
  const query = input.value.trim();

  if (query.length < MIN_LENGTH) {
    results.removeAttribute('aria-busy');
    results.replaceChildren();
    status.textContent = '';
    return;
  }

  const controller = new AbortController();
  searchController = controller;
  showTemplate(results, '#state-loading');
  results.setAttribute('aria-busy', 'true');
  status.textContent = 'Завантаження…';

  try {
    const shows = await searchShows(query, { signal: controller.signal });
    if (shows.length === 0) {
      const text = `Нічого не знайдено за запитом «${query}»`;
      showTemplate(results, '#state-message', text);
      status.textContent = text;
      return;
    }
    renderResults(results, shows);
    status.textContent = `Знайдено: ${shows.length}`;
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error(error);
    showError(results, error, runSearch);
    status.textContent = errorMessage(error);
  } finally {
    if (searchController === controller) results.removeAttribute('aria-busy');
  }
}

const details = document.querySelector('#details');
const showCache = new Map();
let showController;

async function openShow(id) {
  showController?.abort();

  if (showCache.has(id)) {
    details.removeAttribute('aria-busy');
    renderShow(details, showCache.get(id));
    return;
  }

  const controller = new AbortController();
  showController = controller;
  showTemplate(details, '#state-loading');
  details.setAttribute('aria-busy', 'true');
  try {
    const data = await getShow(id, { signal: controller.signal });
    showCache.set(id, data);
    renderShow(details, data);
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error(error);
    showError(details, error, () => openShow(id));
  } finally {
    if (showController === controller) details.removeAttribute('aria-busy');
  }
}

/** Підключає форму пошуку #search і області #results та #details. main.js викликає її один раз. */
export function initApp() {
  results.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="open"]');
    if (!button) return;
    const id = Number(button.closest('[data-id]').dataset.id);
    openShow(id);
  });

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(runSearch, DEBOUNCE_MS);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
  });
}
