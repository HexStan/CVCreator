import React, { useRef } from 'react';

export default function AvatarUploader({ value, onChange }) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 200;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        onChange(canvas.toDataURL('image/png'));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="w-16 h-16 border-2 border-dashed border-border rounded-full flex items-center justify-center overflow-hidden cursor-pointer shrink-0 hover:border-primary transition-colors" onClick={() => inputRef.current?.click()}>
        {value ? (
          <img src={value} alt="头像" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[11px] text-text-secondary text-center leading-tight">+<br />头像</span>
        )}
      </div>
      <div className="flex gap-1.5">
        <button className="btn-default btn-sm" onClick={() => inputRef.current?.click()}>
          {value ? '更换' : '上传'}
        </button>
        {value && (
          <button className="btn-danger btn-sm" onClick={() => onChange('')}>移除</button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
