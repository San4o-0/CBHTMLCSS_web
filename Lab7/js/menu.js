const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById(toggle.getAttribute('aria-controls'));

function setOpen(open) {
  toggle.setAttribute('aria-expanded', String(open));
}

function isOpen() {
  return toggle.getAttribute('aria-expanded') === 'true';
}

toggle.addEventListener('click', () => {
  setOpen(!isOpen());
});

menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    setOpen(false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isOpen()) {
    setOpen(false);
    toggle.focus();
  }
});
