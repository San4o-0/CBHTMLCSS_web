# ЛР-11. Звіт

AI-агент для інтеграції REST API: Fetch API, Promise та async/await, аналіз API-документації,
loading та error states, debugging через Network — застосунок ShowFinder на TVmaze API.

- GitHub repository: <https://github.com/San4o-0/CBHTMLCSS_web>
- GitHub Pages: <https://san4o-0.github.io/CBHTMLCSS_web/Lab11/>
- Самоперевірка: <https://san4o-0.github.io/CBHTMLCSS_web/Lab11/check.html>
- Конспект API: [API.md](API.md) · правила для агента: [AGENTS.md](AGENTS.md)

## AI-агент

- Агент і версія: Claude Code 2.1.269 (розширення VS Code)
- Модель: Claude Opus 5.5 (`claude-opus-5-5`)
- Дата роботи: 2026-10-20

`AGENTS.md` лежить у `Lab11/` — корені проєкту ShowFinder. У корені репозиторію вже є інший
`AGENTS.md` (загальні правила курсу), тому файл правил ShowFinder покладено в теку проєкту;
Claude Code підключає `AGENTS.md` теки, з якою працює.

## 1. Таблиця експериментів (§4)

Усі фрагменти виконано цілими в Console Chrome на `experiments.html` (origin
`http://127.0.0.1:…`) зі справжнім TVmaze; Network — Preserve log, Fetch/XHR, Disable cache
вимкнено.

| # | Що досліджено | Мій аналіз | Фактичний результат (Console і Network) | Пояснення (якщо не збіглося) |
| --- | --- | --- | --- | --- |
| 1 | `fetch` і статус 404 | `fetch` відхилить проміс, спрацює помилка, до `console.log` не дійде | Console: `false 404`, потім `{name: "Not Found", message: "", code: 0, status: 404}`. Червоний рядок `GET …/shows/999999999 404 (Not Found)` пише браузер. Network: `404`, 238 B | **Не збіглося.** `fetch` відхиляє проміс лише коли відповіді немає зовсім (мережа, CORS). 404 — це відповідь: проміс виконується, `ok: false`. Червоний рядок — лог браузера про статус, а не виняток коду |
| 2 | Тіло відповіді читається один раз | `Game of Thrones`; `вдруге:` — ті самі дані; `HTML: SyntaxError` | `Game of Thrones` · `вдруге: TypeError` · `HTML: SyntaxError Unexpected token '<', "<!doctype "... is not valid JSON` | **Не збіглося для другого `json()`.** Тіло — потік: після першого читання він вичерпаний (`bodyUsed`), тому друге читання кидає `TypeError`. `<` — перший символ `<!doctype` HTML-сторінки |
| 3 | `forEach`, `for…of` і `Promise.all` | `forEach: 3`, `через 2 с: 3`; `Promise.all` у ~3 рази швидший | `forEach: 0` · `через 2 с: 3` · `for…of: 131 мс` · `Promise.all: 149 мс`. З Slow 4G: `for…of: 1833 мс` · `Promise.all: 636 мс` (≈2,9×). Waterfall: «сходинки» одна за одною проти трьох паралельних смуг | **Не збіглося для `forEach`.** `forEach` не чекає async-колбеків: `console.log` виконується до відповідей. Без throttling TVmaze відповідає за ~40 мс, тому різниця тоне в шумі; з реальною затримкою паралельні запити ≈3× швидші |
| 4 | `return` і `return await` у `try` | `catch у load: TypeError` | `поза load: TypeError`. З `return await fetch(url)`: `catch у load: TypeError`, результат `null`. Network: `(failed) net::ERR_NAME_NOT_RESOLVED` | **Не збіглося.** `return fetch()` повертає проміс, не чекаючи його: функція виходить з `try`, а відхилення стається пізніше — поза `try`. `return await` чекає всередині `try`, і `catch` спрацьовує |
| 5 | `Promise.all` і `Promise.allSettled` | `all: TypeError`; `allSettled: ['fulfilled', 'rejected', 'fulfilled']` | `all: TypeError` · `allSettled: ["fulfilled", "rejected", "fulfilled"]`. Network: обидва вдалі запити отримали 200, `.invalid` — `(failed)` | Збіглося. `Promise.all` відхиляється з першою помилкою, і результати вдалих запитів (вони дійшли, 200 у Network) губляться; `allSettled` чекає всіх і повертає стан кожного |
| 6 | `AbortController` | `до відповіді: AbortError`; `після відповіді: 200`; `json():` — дані | `до відповіді: AbortError` · `після відповіді: 200` · `json(): AbortError`. Network: обидва — `(canceled)` | **Не збіглося для `json()`.** Сигнал скасовує і читання тіла: заголовки вже прийшли (200), але потік тіла обривається |
| 7 | Заголовки відповіді | усі заголовки, зокрема `date` | `application/json; charset=UTF-8` · `public, max-age=3600` · `null` · `["cache-control", "content-type"]`. Network Response Headers: `access-control-allow-origin, cache-control, content-encoding, date, content-type, vary, server` | **Не збіглося для `date`.** Для чужого домену скрипт бачить лише CORS-safelisted заголовки (`Cache-Control`, `Content-Type`, …) і ті, що сервер дозволив `Access-Control-Expose-Headers`. TVmaze їх не розширює |
| 8 | HTTP-кеш | 1 і 3 — мережа, 2 — кеш | 1: мережа, 951 B · 2: `(disk cache)`, 0 B · 3 (`no-store`): мережа, 951 B | Збіглося. Визначає `Cache-Control: public, max-age=3600` (експ. 7). Під час повтору протягом години і перший запит прийде з кешу — відповідь ще свіжа |
| 9 | Переадресація | `301`, `redirected: false` | `200 true https://api.tvmaze.com/shows/82` · `Game of Thrones`. Network: 2 рядки — `lookup/shows?imdb=… → 301`, потім `shows/82 → 200` | **Не збіглося.** `fetch` сам іде за 301 (`redirect: 'follow'`), тож код бачить лише кінцеву відповідь; про переадресацію кажуть `redirected` і `url` |
| 10 | Рядок запиту | обидва `Law & Order` | plain: `Law ` і ключі `["q", " Order"]` · encoded: `Law & Order`, `?q=Law+%26+Order` | **Не збіглося для plain.** `&` у рядку запиту — роздільник параметрів: без кодування API отримує `q=Law ` і зайвий параметр ` Order` |
| 11 | Два домени TVmaze | `api: 200`, `www: 200` | `api: 200` · `www: TypeError Failed to fetch`. Console: `…blocked by CORS policy: No 'Access-Control-Allow-Origin' header…`. Network: `www…/shows/82 → CORS error` | **Не збіглося.** Запит дійшов до сервера і відповідь прийшла, але без `Access-Control-Allow-Origin`; браузер заблокував **читання** відповіді скриптом. `api.` — API з CORS, `www.` — сайт для людей |
| 12 | Preflight | обидва `200` | `Content-Type: TypeError Failed to fetch` · `Accept: 200`. Network для першого: `OPTIONS → 405` (preflight), `GET → CORS error (PreflightMissingAllowOriginHeader)` | **Не збіглося.** `Content-Type: application/json` не є safelisted, тож браузер спершу шле `OPTIONS`. TVmaze відповідає 405 без CORS-заголовків — «CORS enabled» стосується лише простих запитів. `Accept` — safelisted, preflight немає |
| 13 | `mode: 'no-cors'` | помилки не буде, дані сайту прочитаються | Помилки немає · `opaque 0 false` · `""`. Network: `www…/shows/82 → 301`, далі переадресація `(canceled)` | **Не збіглося для даних.** `no-cors` дає «непрозору» відповідь: статус 0, тіло порожнє. Помилка зникає разом з даними — це не виправлення CORS |

### Висновки

- **4.1 Fetch і Promise.** Головне: `fetch` відхиляє проміс лише без відповіді, тому `response.ok`
  треба перевіряти завжди; тіло читається один раз; `forEach` не чекає async; `return` без
  `await` виводить проміс з-під `try`; скасування — `AbortError`, і воно стосується й тіла.
- **4.2 HTTP.** 301 код не бачить; `max-age=3600` дає `(disk cache)`; скрипт для чужого
  домену бачить лише safelisted заголовки; параметри — тільки через `URLSearchParams`.
- **4.3 CORS.** Дозволяє сервер, блокує браузер — і блокує читання відповіді, а не надсилання.
  Будь-який не-safelisted заголовок у GET дає preflight, якого TVmaze не підтримує (405).
  `no-cors` лише ховає помилку разом з даними.

## 2. Результат `check.html` на опублікованій сторінці

<https://san4o-0.github.io/CBHTMLCSS_web/Lab11/check.html> — **Пройдено: 24 з 24** (C1 — 9,
C2 — 5, C3 — 10).

## 3. Чек-лист Network (ТЗ §6)

Перевірено на фінальній версії `index.html` зі справжнім TVmaze, Chrome, Preserve log,
Fetch/XHR.

| Пункт | Результат |
| --- | --- |
| N1 · Запит пошуку | `GET https://api.tvmaze.com/search/shows?q=girls → 200`, 4,7 kB; Payload `q: girls`; Preview — масив із 10 `{ score, show }`; Response Headers: `cache-control: public, max-age=3600`, `access-control-allow-origin: *` |
| N2 · Повільна мережа | Slow 4G: під час запиту «gir» — «Завантаження…», `aria-busy="true"`, статус «Завантаження…»; після дописування «ls» запит `q=gir → (canceled)`, `q=girls → 200`; на сторінці «Знайдено: 10» |
| N3 · Немає мережі | Request blocking `*api.tvmaze.com*`: `q=lost → (blocked)`, на сторінці й у статусі «Немає з'єднання з TVmaze.» і «Спробувати ще»; після зняття блокування «Спробувати ще» → `200`, «Знайдено: 10» |
| N4 · Initiator | `GET /shows/139?embed[]=episodes&embed[]=cast` — Initiator (стек): `request` `src/api.js:41` ← `getShow` `src/api.js:78` ← `openShow` `src/app.js:106` ← обробник `click` на `#results` `src/app.js:128` |
| N5 · Кеш | Girls → Gilmore Girls → знову Girls: утретє запиту немає (кеш застосунку, C2.4). Повторний пошук «girls» — Size `(disk cache)`, 0 B: відповідь має `Cache-Control: public, max-age=3600` (розділ Caching TVmaze, експ. 8) |
| N6 · Console | Увесь сценарій (пошук, сторінка серіалу, збої з N3) — жодного `Uncaught`. Червоні рядки «Failed to load resource» від заблокованих запитів пише браузер |

> Знімки екрана панелі Network для кожного пункту N1–N6 — додати з власного DevTools.

## 4. Підсумок виконаної роботи

Коміти: [`3f0744a`](https://github.com/San4o-0/CBHTMLCSS_web/commit/3f0744a) starter ·
[`fb234a1`](https://github.com/San4o-0/CBHTMLCSS_web/commit/fb234a1) API notes ·
[`a295ebe`](https://github.com/San4o-0/CBHTMLCSS_web/commit/a295ebe) / [`ed66655`](https://github.com/San4o-0/CBHTMLCSS_web/commit/ed66655) Challenge 1 ·
[`a6a3e28`](https://github.com/San4o-0/CBHTMLCSS_web/commit/a6a3e28) / [`05f5289`](https://github.com/San4o-0/CBHTMLCSS_web/commit/05f5289) Challenge 2 ·
[`8fb2e08`](https://github.com/San4o-0/CBHTMLCSS_web/commit/8fb2e08) Agent rules ·
[`cec69f6`](https://github.com/San4o-0/CBHTMLCSS_web/commit/cec69f6) / [`27182d3`](https://github.com/San4o-0/CBHTMLCSS_web/commit/27182d3) Challenge 3.

### Challenge 1 — пошук (чернетка: 3 з 24)

Чернетка AI додала до GET `headers: { 'Content-Type': 'application/json' }` → preflight
`OPTIONS → 405` → `CORS error` на **кожен** пошук, у Network видно саме це; на сторінці навіки
«Завантаження…». Крім того: статус «Знайдено серіалів: N», пошук від 1 символу, Enter не
скасовував відкладений пошук (2 запити), немає `aria-busy`, текст порожнього результату без
запиту, немає скасування застарілого запиту.

**Виправлено:** заголовок прибрано, параметр — через `URLSearchParams`; мінімум 2 символи;
`clearTimeout` + `AbortController` у кожному пошуку (Enter не дублює запит, старіша відповідь не
замінює новішу); `aria-busy`, статуси й тексти з ТЗ; `AbortError` ігнорується.

### Challenge 2 — сторінка серіалу (чернетка: 14 з 24, C2 — 1 з 5)

Чернетка запитувала серіал, епізоди й акторів **один за одним** (3 запити «сходинками» у
Waterfall), не мала `aria-busy`, кешу й скасування — сторінка попереднього серіалу затирала
останній вибраний.

**Виправлено:** один запит `?embed[]=episodes&embed[]=cast`; `aria-busy` у `#details`; кеш
успішних відповідей у `Map`; `AbortController` для вибору серіалу.

### Challenge 3 — помилки (чернетка з `AGENTS.md`: 17 з 24)

З правилами агент одразу перевіряв `response.ok`, повторював 429 один раз через 3 с, ігнорував
`AbortError`, прибирав `aria-busy` у `finally` і кешував лише успішні відповіді. Але:

- `showTemplate` записував текст у `node.querySelector('.state, .state__text')` — це зовнішній
  `.state`, тож текст **стирав кнопку «Спробувати ще»**, а наступний `addEventListener` на `null`
  давав `Uncaught (in promise) TypeError`;
- тексти не з ТЗ («Помилка сервера TVmaze (503)…», «Немає з'єднання з інтернетом.») і **код
  статусу в тексті** для користувача;
- під час очікування після 429 статус лишався «Завантаження…»; 404 серіалу йшов у загальну
  помилку; відповідь не в JSON показувала технічне повідомлення.

**Виправлено:** текст — у `.state__text`, якщо він є; тексти §3.4 без кодів статусу; окремий
`NotJsonError`; 404 серіалу — «Серіал не знайдено»; колбек `onRetry` ставить статус «Забагато
запитів до TVmaze, повторюю…».

### Заборонені файли

`check.html`, `check/`, `offline.html`, `src/view.js` не змінено в жодному коміті:
`git diff --stat 3f0744a -- Lab11/check.html Lab11/check Lab11/offline.html Lab11/src/view.js` —
порожній. Агент їх не змінював.
