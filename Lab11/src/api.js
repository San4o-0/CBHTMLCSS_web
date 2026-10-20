/**
 * Запити до TVmaze API: https://www.tvmaze.com/api. Які ендпоїнти, які відповіді й помилки —
 * ТЗ, §3.2 і §4.
 */

/** Адреса API. */
export const API = 'https://api.tvmaze.com';

/** Скільки чекати перед повтором після 429 (документація TVmaze: «кілька секунд»). */
const RETRY_DELAY_MS = 3000;

/** HTTP-помилка відповіді TVmaze. */
export class ApiError extends Error {
  constructor(status) {
    super(`TVmaze відповів ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

/** Відповідь прийшла, але це не JSON (наприклад, HTML-сторінка помилки). */
export class NotJsonError extends Error {
  constructor(cause) {
    super('TVmaze повернув не JSON', { cause });
    this.name = 'NotJsonError';
  }
}

/** GET з перевіркою response.ok і одним повтором після 429. */
async function request(url, { signal, onRetry } = {}) {
  let response = await fetch(url, { signal });
  if (response.status === 429) {
    onRetry?.();
    await wait(RETRY_DELAY_MS, signal);
    response = await fetch(url, { signal });
  }
  if (!response.ok) throw new ApiError(response.status);
  try {
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new NotJsonError(error);
  }
}

/**
 * C1. Шукає серіали за назвою. Повертає масив серіалів (об'єктів show) у порядку відповіді
 * API — те, що приймає renderResults з view.js.
 *
 * @param {string} query
 * @param {{ signal?: AbortSignal, onRetry?: () => void }} [options]
 * @returns {Promise<object[]>}
 */
export async function searchShows(query, { signal, onRetry } = {}) {
  const data = await request(`${API}/search/shows?${new URLSearchParams({ q: query })}`, { signal, onRetry });
  return data.map((item) => item.show);
}

/**
 * C2. Завантажує серіал з епізодами й акторами. Повертає { show, episodes, cast } — те, що
 * приймає renderShow з view.js.
 *
 * @param {number} id
 * @param {{ signal?: AbortSignal, onRetry?: () => void }} [options]
 * @returns {Promise<{ show: object, episodes: object[], cast: object[] }>}
 */
export async function getShow(id, { signal, onRetry } = {}) {
  const show = await request(`${API}/shows/${id}?embed[]=episodes&embed[]=cast`, { signal, onRetry });
  const { episodes, cast } = show._embedded;
  return { show, episodes, cast };
}
