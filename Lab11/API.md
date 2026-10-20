# TVmaze API — конспект

Документація: <https://www.tvmaze.com/api>. Кожен рядок перевірено справжнім запитом з
`experiments.html` (origin `http://127.0.0.1`) у Chrome, панель Network.

| Питання | Що каже документація | Що показав запит (адреса) |
| --- | --- | --- |
| Ендпоїнт пошуку за назвою, параметри | `GET /search/shows?q=:query`; нечіткий пошук (fuzziness 2), результати за релевантністю | `https://api.tvmaze.com/search/shows?q=girls` → 200. Параметр один — `q`, значення треба кодувати: `Law & Order` → `?q=Law+%26+Order` (без кодування API отримує `q=Law `) |
| Форма відповіді пошуку | Повна інформація про кожен серіал, найкращі збіги зверху | Масив із 10 елементів `{ score, show }`; перший — `{ score: 0.89, show: { id: 139, name: "Girls" } }`. Для `renderResults` потрібні саме `show`, не весь елемент |
| Ендпоїнт серіалу; як отримати епізоди й акторів одним запитом | `GET /shows/:id`; `embed` додає пов'язані колекції, кілька — масивом: `?embed[]=episodes&embed[]=cast`. Окремо: `/shows/:id/episodes`, `/shows/:id/cast` | `https://api.tvmaze.com/shows/139?embed[]=episodes&embed[]=cast` → 200, `_embedded: { episodes: [62], cast: [8] }`. Епізод: `id, name, season, number, airdate…`; актор: `{ person, character, self, voice }` |
| Поля серіалу, що можуть бути `null` (з прикладом серіалу) | `image` може бути `null`; поля без значення — `null` | `https://api.tvmaze.com/search/shows?q=girls`: GIRLS (id 41734) — `rating.average: null`, `summary: null`; Girls (id 139) — `ended: null`, `webChannel: null`; Stranger Things (`/shows/2993`) — `network: null`, є `webChannel` |
| Що повертає пошук без результатів | — | `https://api.tvmaze.com/search/shows?q=zzqxzzqx` → **200**, тіло `[]`. Це не помилка |
| Що повертає неіснуючий id | — | `https://api.tvmaze.com/shows/999999999` → **404**, `ok: false`, тіло JSON `{ name: "Not Found", status: 404 }`. `fetch` проміс **не** відхиляє |
| Ліміт запитів і що робити на 429 | Щонайменше 20 запитів за 10 с з однієї IP; при перевищенні — 429; «просто почекайте кілька секунд» | Навмисно не провокував (щоб не блокувати IP). Заголовка `Retry-After` скрипт для чужого домену не бачить: видимі лише `cache-control`, `content-type` (`/search/shows?q=lost`). Тому — одна повторна спроба через 2–5 с |
| Кешування: що кешує TVmaze і що — браузер | Усі відповіді кешуються на load balancer-ах TVmaze 60 хв | Відповідь містить `cache-control: public, max-age=3600` → браузер теж кешує годину: повторний `GET /shows/1` — `(disk cache)`, 0 байт; з `cache: 'no-store'` — знову мережа |
| CORS: що обіцяє документація і що показав експеримент 12 | «All endpoints are CORS enabled» | Простий GET працює (`access-control-allow-origin: *`). Але з `Content-Type: application/json` браузер шле preflight `OPTIONS /shows/82` → **405** без CORS-заголовків → `CORS error`, `TypeError: Failed to fetch`. Отже лише прості GET без власних заголовків |
| Ліцензія й атрибуція | CC BY-SA; вказати TVmaze як джерело, наприклад посиланням на TVmaze | Посилання на TVmaze, API і ліцензію є у footer `index.html` — не прибирати |
