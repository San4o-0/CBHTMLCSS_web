# Frontend Lab 1

Навчальний статичний проєкт до лабораторної роботи №1 з курсу Web Development 2026.
Сторінка використовується для перевірки налаштованого середовища розробки.

## Структура

```
Lab1/
├── index.html
├── styles.css
├── script.js
├── package.json
├── eslint.config.js
├── .prettierrc.json
├── .editorconfig
├── .gitignore
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── .agents/skills/frontend-review/SKILL.md
├── AGENTS.md
└── README.md
```

## Локальний запуск

У VS Code: правий клік на `index.html` → **Show Preview** (розширення Live Preview).

Або через Node.js:

```bash
npx serve .
```

## Перевірка коду

```bash
npm install
npx eslint .
npx prettier --write .
```

## Посилання

- GitHub: https://github.com/San4o-0/CBHTMLCSS_web
- GitHub Pages: https://san4o-0.github.io/CBHTMLCSS_web/Lab1/
- Vercel: https://cbhtmlcss-weblab1.vercel.app/
