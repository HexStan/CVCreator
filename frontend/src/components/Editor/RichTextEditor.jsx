import React from 'react';
import './RichTextEditor.css';

export default function RichTextEditor({ value, onChange }) {
  return (
    <div className="richtext-editor">
      <div className="richtext-hint">
        支持 Markdown 语法。使用 # 一级标题实现自动分页。
      </div>
      <textarea
        className="richtext-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="在此输入简历详细内容...
        
# 工作经历
- 公司A | 职位 | 时间
  描述...

# 教育背景
- 大学 | 学位 | 时间

# 项目经验
- 项目名称
  描述..."
        spellCheck={false}
      />
    </div>
  );
}
