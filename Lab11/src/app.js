/**
 * Поведінка ShowFinder: пошук (C1), сторінка серіалу (C2), помилки й повторні спроби (C3).
 * Тут — обробники подій, життєвий цикл кожного запиту й стани областей #results і #details:
 * завантаження, результат, порожній результат, помилка. Специфікація — ТЗ, §3–4.
 */
import { getShow, searchShows } from './api.js';
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
    results.removeAttribute('aria-busy');
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
    status.textContent = 'Помилка пошуку';
  }
}

/** Підключає форму пошуку #search і області #results та #details. main.js викликає її один раз. */
export function initApp() {
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(runSearch, DEBOUNCE_MS);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
  });
}
