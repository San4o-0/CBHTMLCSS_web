# Lab 6 — Responsive Layout, Container Queries, Fluid Typography

Дослідницькі експерименти (розділ 4) і code challenges 1–10 (розділ 5): Flexbox і Grid,
`auto-fit + minmax()`, subgrid, Container Queries і cq-одиниці, fluid typography з `clamp()`,
debugging layout у DevTools, рев'ю AI-згенерованого layout.

## Структура

```
Lab6/
├── index.html                      # зміст ЛР-6
├── base.css                        # спільні токени та оформлення сторінок
├── list.css                        # стилі списків-змістів
├── research/                       # розділ 4
│   ├── index.html
│   ├── flex-grid.html              # 4.1
│   ├── media-queries.html          # 4.2
│   ├── container-queries.html      # 4.3
│   ├── fluid-typography.html       # 4.4
│   ├── subgrid.html                # 4.5
│   └── NOTES.md                    # відповіді, спостереження, висновки
├── challenges/                     # розділ 5
│   ├── index.html
│   ├── 01-header.html
│   ├── 02-cards.html
│   ├── 03-page-layout.html
│   ├── 04-subgrid.html
│   ├── 05-container-card.html
│   ├── 06-cq-units.html
│   ├── 07-fluid-typography.html
│   ├── 08-debug-broken.html        # навмисно зламана (CSS з умови)
│   ├── 08-debug-fixed.html
│   ├── 09-ai-dashboard-original.html  # AI-рішення без змін
│   ├── 09-ai-dashboard-final.html
│   ├── 10-feature-section.html
│   └── NOTES.md                    # пояснення, таблиці Challenge 8 і 9, виміри
└── README.md
```

Starter `layout-lab-starter.zip` не використано: розмітку і зламаний CSS для Challenge 8 взято з
тексту завдання.

## Локальний запуск

```bash
npx serve .
```

Далі відкрити `/Lab6/`.

## Підтримка браузерами

Container queries і cq-одиниці — Chrome/Edge 105+, Firefox 110+, Safari 16+. Subgrid —
Chrome/Edge 117+, Firefox 71+, Safari 16+.

## Посилання

- GitHub: https://github.com/San4o-0/CBHTMLCSS_web
- GitHub Pages: https://san4o-0.github.io/CBHTMLCSS_web/Lab6/
- Vercel: https://<project>.vercel.app/
