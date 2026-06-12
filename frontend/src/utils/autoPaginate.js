import { marked } from 'marked';

export function splitByPageBreak(markdown) {
  if (!markdown) return [''];
  const sections = markdown.split(/<!--\s*pagebreak\s*-->/g);
  return sections.map((s) => s.trim()).filter((s, i) => s || i === 0);
}

let measureOuter = null;
let measureBody = null;
let measureContent = null;
let lastBodyClass = null;

function getMeasureContainer(fontFamily, bodyClass, bodyStyle) {
  if (!measureOuter || !document.body.contains(measureOuter)) {
    measureOuter = document.createElement('div');
    measureOuter.style.cssText =
      'position:fixed;top:0;left:-9999px;visibility:hidden;pointer-events:none;overflow:hidden;';

    measureBody = document.createElement('div');
    measureOuter.appendChild(measureBody);

    measureContent = document.createElement('div');
    measureContent.className = 'markdown-body';
    measureBody.appendChild(measureContent);

    document.body.appendChild(measureOuter);
  }

  measureOuter.style.fontFamily = fontFamily || '';

  if (bodyClass !== lastBodyClass) {
    lastBodyClass = bodyClass;
    measureBody.className = bodyClass || '';
    measureBody.style.cssText = '';
    if (bodyStyle && typeof bodyStyle === 'object') {
      for (const [prop, val] of Object.entries(bodyStyle)) {
        measureBody.style[prop] = val;
      }
    }
  }

  return { outer: measureOuter, content: measureContent };
}

function measureCumulativeHeight(htmls, width, fontFamily, bodyClass, bodyStyle) {
  const { outer, content } = getMeasureContainer(fontFamily, bodyClass, bodyStyle);
  outer.style.width = `${width}px`;
  content.innerHTML = '';

  for (const html of htmls) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    content.appendChild(wrapper);
  }

  const height = outer.getBoundingClientRect().height;
  content.innerHTML = '';
  return height;
}

export function autoPaginate(markdown, pageContentHeightPx, contentWidthPx, firstPageContentHeightPx = null, fontFamily = null, bodyClass = null, bodyStyle = null) {
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
      fontFamily,
      bodyClass,
      bodyStyle
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
