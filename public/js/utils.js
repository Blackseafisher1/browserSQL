export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function html(strings, ...values) {
  const str = strings.reduce((acc, s, i) => acc + s + (values[i] !== undefined ? values[i] : ''), '');
  const template = document.createElement('template');
  template.innerHTML = str;
  return template.content;
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
