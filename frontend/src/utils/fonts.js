import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from './api.js';

const injectedFamilies = new Set();
let styleElement = null;

function ensureStyleElement() {
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'system-fonts-css';
    document.head.appendChild(styleElement);
  }
  return styleElement;
}

function injectAllFontFaces(fonts) {
  const el = ensureStyleElement();
  const rules = fonts.map((f) => {
    const family = f.cssFamily;
    if (injectedFamilies.has(family)) return '';
    injectedFamilies.add(family);
    const format = f.id.toLowerCase().includes('otf') || f.id.toLowerCase().includes('otc')
      ? 'opentype' : 'truetype';
    return `@font-face { font-family: "${family}"; src: url("${f.url}") format("${format}"); font-weight: ${f.weight}; font-style: normal; }`;
  });
  el.textContent = rules.filter(Boolean).join('\n');
}

export function useFonts() {
  const [fonts, setFonts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  const loadFonts = useCallback(async () => {
    if (loadedRef.current) return;
    try {
      const data = await api.fonts.list();
      const list = data.fonts || [];
      injectAllFontFaces(list);
      setFonts(list);
      loadedRef.current = true;
    } catch (e) {
      console.error('加载字体失败:', e);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  return { fonts, loaded };
}

export function getCssFamily(fontId) {
  return fontId ? `SysFont-${fontId}` : '';
}
