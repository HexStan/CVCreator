import { marked } from 'marked';

export function splitByPageBreak(markdown) {
  if (!markdown) return [''];
  const sections = markdown.split(/<!--\s*pagebreak\s*-->/g);
  return sections.map((s) => s.trim()).filter((s, i) => s || i === 0);
}

let measureContainer = null;

function getMeasureContainer() {
  if (measureContainer && document.body.contains(measureContainer)) return measureContainer;

  measureContainer = document.createElement('div');
  measureContainer.style.cssText =
    'position:fixed;top:0;left:-9999px;visibility:hidden;pointer-events:none;';
  measureContainer.className = 'markdown-body';
  document.body.appendChild(measureContainer);
  return measureContainer;
}

function measureBlockHeight(blockHTML, width) {
  const container = getMeasureContainer();
  container.style.width = `${width}px`;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = blockHTML;
  container.appendChild(wrapper);

  const style = window.getComputedStyle(wrapper);
  const height =
    wrapper.getBoundingClientRect().height +
    (parseFloat(style.marginTop) || 0) +
    (parseFloat(style.marginBottom) || 0);

  container.removeChild(wrapper);
  return height;
}

export function autoPaginate(markdown, pageContentHeightPx, contentWidthPx) {
  if (!markdown || !markdown.trim()) return [''];

  const tokens = marked.lexer(markdown);
  const pages = [];
  let currentPageRaws = [];
  let currentHeight = 0;

  for (const token of tokens) {
    if (token.type === 'space') continue;
    if (!token.raw && token.type !== 'hr') continue;

    const raw = token.raw || '---';
    const blockHTML = marked.parse(raw, { async: false });
    const blockHeight = measureBlockHeight(blockHTML, contentWidthPx);

    if (currentHeight + blockHeight > pageContentHeightPx && currentPageRaws.length > 0) {
      pages.push(currentPageRaws.join('\n\n'));
      currentPageRaws = [];
      currentHeight = 0;
    }

    currentPageRaws.push(raw);
    currentHeight += blockHeight;
  }

  if (currentPageRaws.length > 0) {
    pages.push(currentPageRaws.join('\n\n'));
  }

  return pages.length > 0 ? pages : [''];
}
