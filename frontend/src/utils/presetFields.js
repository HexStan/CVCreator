export const PRESET_FIELDS = [
  { key: 'name', label: '姓名', width: 2, defaultValue: '' },
  { key: 'jobTitle', label: '职位', width: 2, defaultValue: '' },
  { key: 'email', label: '邮箱', width: 2, defaultValue: '' },
  { key: 'phone', label: '电话', width: 1, defaultValue: '' },
  { key: 'location', label: '所在地', width: 1, defaultValue: '' },
  { key: 'website', label: '个人网站', width: 2, defaultValue: '' },
  { key: 'github', label: 'GitHub', width: 1, defaultValue: '' },
  { key: 'linkedin', label: 'LinkedIn', width: 1, defaultValue: '' },
  { key: 'wechat', label: '微信', width: 1, defaultValue: '' },
  { key: 'birth', label: '出生日期', width: 1, defaultValue: '' },
];

export const ALL_PRESET_KEYS = PRESET_FIELDS.map((f) => f.key);

export function getPresetField(key) {
  return PRESET_FIELDS.find((f) => f.key === key) || null;
}
