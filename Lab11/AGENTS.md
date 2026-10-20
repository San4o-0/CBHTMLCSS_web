# ShowFinder — правила для AI-агента

## Межі
- Змінюй лише `src/api.js`, `src/app.js`, `index.html`, `styles.css`. Не чіпай `src/view.js`,
  `check.html`, `check/`, `offline.html`.
- Лише `fetch` і лише `https://api.tvmaze.com`. Без бібліотек, CORS-проксі, `alert()`.
- Дані на сторінку — лише через `renderResults` і `renderShow` з `view.js`.

## Контракт TVmaze (перевірено в Network)
- Пошук: `GET /search/shows?q=…` → 200, масив `{ score, show }`; немає збігів → 200 `[]`.
  `renderResults` приймає масив `show`, а не елементи пошуку.
- Серіал з епізодами й акторами — один запит: `GET /shows/:id?embed[]=episodes&embed[]=cast`,
  дані в `show._embedded.episodes` і `show._embedded.cast`.
- Неіснуючий id → 404 з JSON-тілом. `fetch` НЕ відхиляє проміс на 404/429/5xx — завжди
  перевіряй `response.ok` до `json()`. Відхилений проміс fetch = немає мережі.
- 429 = ліміт (20 запитів / 10 с з IP). `Retry-After` скрипт не бачить: чекати 2–5 с і
  повторити один раз.
- Поля можуть бути `null` (`rating.average`, `summary`, `network`, `ended`, `image`).

## CORS — чого не робити
- Жодних власних заголовків у GET: `Content-Type: application/json` викликає preflight
  `OPTIONS`, TVmaze відповідає 405 → CORS error. Це була помилка чернетки C1.
- Без `mode: 'no-cors'` (дає порожню opaque-відповідь) і `credentials: 'include'`.
- Параметри — через `URLSearchParams`, не через шаблонний рядок.

## Запити й стани (висновки з аудиту C1–C2)
- Кожен новий пошук або вибір серіалу скасовує попередній через `AbortController`.
  `AbortError` — не помилка: нічого не показувати і не писати `console.error`.
- Незалежні дані — одним запитом з embed або паралельно, ніколи один за одним.
- Під час запиту область має `aria-busy="true"` і шаблон `#state-loading`; після
  будь-якого результату чи помилки `aria-busy` прибрати (`finally`).
- Кешувати в пам'яті лише успішні відповіді.
- Тексти для користувача — лише ті, що в ТЗ §3.4; технічні деталі — `console.error`.
