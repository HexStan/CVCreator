import { useEffect, useState, useCallback } from 'react';
import { api } from './api.js';

let injectedFamilies = new Set();

function injectFontFace(font) {
  const family = `UserFont-${font.id}`;
  if (injectedFamilies.has(family)) return family;

  const formatMap = {
    ttf: 'truetype',
    otf: 'opentype',
    woff: 'woff',
    woff2: 'woff2',
  };

  const style = document.createElement('style');
  style.textContent = `@font-face { font-family: "${family}"; src: url("${font.url}") format("${formatMap[font.format] || 'truetype'}"); }`;
  document.head.appendChild(style);
  injectedFamilies.add(family);
  return family;
}

export function useFonts() {
  const [fonts, setFonts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadFonts = useCallback(async () => {
    try {
      const data = await api.fonts.list();
      const fontsWithFamily = data.fonts.map((f) => {
        const family = injectFontFace(f);
        return { ...f, family };
      });
      setFonts(fontsWithFamily);
    } catch (e) {
      console.error('加载字体失败:', e);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  return { fonts, loaded, reload: loadFonts };
}
