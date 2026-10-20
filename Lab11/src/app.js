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

function showTemplate(container, id, text) {
  const node = document.querySelector(id).content.cloneNode(true);
  if (text) node.querySelector('.state, .state__text').textContent = text;
  container.replaceChildren(node);
}

async function runSearch() {
  const query = input.value.trim();
  if (!query) {
    results.replaceChildren();
    status.textContent = '';
    return;
  }

  showTemplate(results, '#state-loading');
  status.textContent = 'Шукаю…';

  try {
    const shows = await searchShows(query);
    if (shows.length === 0) {
      showTemplate(results, '#state-message', 'Нічого не знайдено');
      status.textContent = 'Нічого не знайдено';
      return;
    }
    renderResults(results, shows);
    status.textContent = `Знайдено серіалів: ${shows.length}`;
  } catch (error) {
    console.error(error);
    status.textContent = 'Помилка пошуку';
  }
}

let timer;

/** Підключає форму пошуку #search і області #results та #details. main.js викликає її один раз. */
export function initApp() {
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 300);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
  });
}
