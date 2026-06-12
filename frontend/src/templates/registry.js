import React, { lazy } from 'react';

const templatesMap = {
  classic: {
    name: '经典',
    component: lazy(() => import('./Classic.jsx')),
  },
  modern: {
    name: '现代',
    component: lazy(() => import('./Modern.jsx')),
  },
  minimal: {
    name: '极简',
    component: lazy(() => import('./Minimal.jsx')),
  },
  split: {
    name: '双栏',
    component: lazy(() => import('./Split.jsx')),
  },
  lines: {
    name: '线条',
    component: lazy(() => import('./Lines.jsx')),
  },
  bold: {
    name: '粗犷',
    component: lazy(() => import('./Bold.jsx')),
  },
  zen: {
    name: '禅意',
    component: lazy(() => import('./Zen.jsx')),
  },
};

export function getTemplate(key) {
  const t = templatesMap[key];
  if (!t) return templatesMap.classic.component;
  return t.component;
}

export function getTemplateName(key) {
  return templatesMap[key]?.name || '经典';
}

export function getAllTemplates() {
  return Object.entries(templatesMap).map(([key, val]) => ({ key, name: val.name }));
}

export default templatesMap;
