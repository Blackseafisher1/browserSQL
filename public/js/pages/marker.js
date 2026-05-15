import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

export function renderMarkdown(text) {
  return marked.parse(text);
}
