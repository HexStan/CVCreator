import React from 'react';

export default function RichTextEditor({ value, onChange }) {
  return (
    <div className="flex flex-col h-full">
      <div className="text-[11px] text-text-secondary mb-1.5 py-1 px-2 bg-highlight-blue rounded-[3px]">
        支持 Markdown 语法。使用 &lt;!-- pagebreak --&gt; 控制分页。
      </div>
      <textarea
        className="flex-1 w-full resize-none border border-border rounded-md p-2.5 text-[13px] leading-relaxed font-mono outline-none focus:border-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`在此输入简历详细内容...

# 工作经历
- 公司A | 职位 | 时间
  描述...

<!-- pagebreak -->

# 教育背景
- 大学 | 学位 | 时间

<!-- pagebreak -->

# 项目经验
- 项目名称
  描述...`}
        spellCheck={false}
      />
    </div>
  );
}
