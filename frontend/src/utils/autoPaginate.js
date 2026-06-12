import { marked } from 'marked';

export function splitByPageBreak(markdown) {
  if (!markdown) return [''];
  const sections = markdown.split(/<!--\s*pagebreak\s*-->/g);
  return sections.map((s) => s.trim()).filter((s, i) => s || i === 0);
}

let measureContainer = null;

function getMeasureContainer(fontFamily) {
  if (measureContainer && document.body.contains(measureContainer)) {
    measureContainer.style.fontFamily = fontFamily || '';
    return measureContainer;
  }

  measureContainer = document.createElement('div');
  measureContainer.style.cssText =
    'position:fixed;top:0;left:-9999px;visibility:hidden;pointer-events:none;overflow:hidden;';
  measureContainer.className = 'markdown-body';
  measureContainer.style.fontFamily = fontFamily || '';
  document.body.appendChild(measureContainer);
  return measureContainer;
}

function measureCumulativeHeight(htmls, width, fontFamily) {
  const container = getMeasureContainer(fontFamily);
  container.style.width = `${width}px`;
  container.innerHTML = '';

  for (const html of htmls) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    container.appendChild(wrapper);
  }

  const height = container.getBoundingClientRect().height;
  container.innerHTML = '';
  return height;
}

export function autoPaginate(markdown, pageContentHeightPx, contentWidthPx, firstPageContentHeightPx = null, fontFamily = null) {
  if (!markdown || !markdown.trim()) return [''];

  const tokens = marked.lexer(markdown);
  const blocks = [];
  for (const token of tokens) {
    if (token.type === 'space') continue;
    if (!token.raw && token.type !== 'hr') continue;
    const raw = token.raw || '---';
    blocks.push({ raw, html: marked.parse(raw, { async: false }) });
  }

  if (blocks.length === 0) return [''];

  const pages = [];
  let pageBlocks = [];
  let isFirstPage = true;

  for (const block of blocks) {
    const capacity = (isFirstPage && firstPageContentHeightPx != null)
      ? firstPageContentHeightPx
      : pageContentHeightPx;

    if (pageBlocks.length === 0) {
      pageBlocks.push(block);
      continue;
    }

    const testBlocks = pageBlocks.concat(block);
    const totalHeight = measureCumulativeHeight(
      testBlocks.map((b) => b.html),
      contentWidthPx,
      fontFamily
    );

    if (totalHeight > capacity) {
      pages.push(pageBlocks.map((b) => b.raw).join('\n\n'));
      pageBlocks = [block];
      isFirstPage = false;
    } else {
      pageBlocks.push(block);
    }
  }

  if (pageBlocks.length > 0) {
    pages.push(pageBlocks.map((b) => b.raw).join('\n\n'));
  }

  return pages;
}
