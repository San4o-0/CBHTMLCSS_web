const themeToggle = document.getElementById('theme-toggle');
const counterValue = document.getElementById('counter-value');
const plus = document.getElementById('plus');
const minus = document.getElementById('minus');

let count = 0;

function setTheme(theme) {
  document.body.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Світла тема' : 'Темна тема';
  localStorage.setItem('lab1-theme', theme);
}

setTheme(localStorage.getItem('lab1-theme') === 'dark' ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
  setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
});

plus.addEventListener('click', () => {
  count = count + 1;
  counterValue.textContent = count;
});

minus.addEventListener('click', () => {
  count = count - 1;
  counterValue.textContent = count;
});
