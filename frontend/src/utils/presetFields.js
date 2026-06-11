export const WIDTH_GEARS = [
  { col: 3,  label: '25%' },
  { col: 4,  label: '33%' },
  { col: 6,  label: '50%' },
  { col: 8,  label: '67%' },
  { col: 9,  label: '75%' },
  { col: 12, label: '100%' },
];

export const PRESET_FIELDS = [
  { key: 'name', label: '姓名', width: 12, defaultValue: '' },
  { key: 'jobTitle', label: '职位', width: 6, defaultValue: '' },
  { key: 'email', label: '邮箱', width: 6, defaultValue: '' },
  { key: 'phone', label: '电话', width: 4, defaultValue: '' },
  { key: 'location', label: '所在地', width: 4, defaultValue: '' },
  { key: 'website', label: '个人网站', width: 6, defaultValue: '' },
  { key: 'github', label: 'GitHub', width: 4, defaultValue: '' },
  { key: 'linkedin', label: 'LinkedIn', width: 4, defaultValue: '' },
  { key: 'wechat', label: '微信', width: 4, defaultValue: '' },
  { key: 'birth', label: '出生日期', width: 4, defaultValue: '' },
];

export const ALL_PRESET_KEYS = PRESET_FIELDS.map((f) => f.key);

export function getPresetField(key) {
  return PRESET_FIELDS.find((f) => f.key === key) || null;
}

export function findGear(col) {
  return WIDTH_GEARS.find((g) => g.col === col) || WIDTH_GEARS[1];
}

export function getGearIndex(col) {
  const idx = WIDTH_GEARS.findIndex((g) => g.col === col);
  return idx >= 0 ? idx : 1;
}

export function clampWidth(w) {
  const cols = WIDTH_GEARS.map((g) => g.col);
  return cols.includes(w) ? w : (cols[1] || 4);
}
