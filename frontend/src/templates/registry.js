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
