import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

const renderer = new marked.Renderer();

renderer.listitem = function ({ text, raw, task, checked }) {
  if (task) {
    const cls = checked ? 'is-done' : '';
    const mark = checked ? '✓' : '';
    return `<li class="tutorial-checklist-item ${cls}" data-checked="${checked}">
      <span class="check-box">${mark}</span>
      <span>${text}</span>
    </li>`;
  }
  return `<li>${text}</li>`;
};

renderer.list = function ({ items, ordered, start }) {
  const hasTasks = items.some(i => i.task);
  if (hasTasks) {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? '' : 'tutorial-checklist';
    const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
    return `<${tag} class="${cls}"${startAttr}>${items.map(i => this.listitem(i)).join('')}</${tag}>`;
  }
  const tag = ordered ? 'ol' : 'ul';
  const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
  return `<${tag}${startAttr}>${items.map(i => this.listitem(i)).join('')}</${tag}>`;
};

export function renderMarkdown(text) {
  return marked.parse(text, { renderer });
}
