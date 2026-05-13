export function renderMarkdown(text) {
  const lines = text.split('\n');
  let html = '';
  let inCode = false;
  let codeBuf = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.startsWith('```')) {
      if (inCode) {
        html += '<pre><code>' + esc(codeBuf.join('\n')) + '</code></pre>\n';
        codeBuf = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }

    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
    line = line.replace(/`([^`]+)`/g, '<code>$1</code>');
    line = line.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>');

    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      html += `<h${level}>${line.slice(level + 1)}</h${level}>\n`;
      continue;
    }
    if (/^[-*+]\s/.test(line)) {
      if (!inList) { html += '<ul>\n'; inList = true; }
      html += `<li>${line.replace(/^[-*+]\s/, '')}</li>\n`;
      continue;
    }
    if (inList) { html += '</ul>\n'; inList = false; }

    if (line.trim() === '') { html += '<br>\n'; continue; }
    html += `<p>${line}</p>\n`;
  }
  if (inCode) html += '<pre><code>' + esc(codeBuf.join('\n')) + '</code></pre>\n';
  if (inList) html += '</ul>\n';
  return html;
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
