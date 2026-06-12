const EXPORT_SCALE = 3;

async function capturePageElement(pageEl) {
  const html2canvas = (await import('html2canvas')).default;
  return html2canvas(pageEl, {
    scale: EXPORT_SCALE,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function capturePages(container) {
  const inner = container.querySelector('.preview-stage-inner');
  const stage = container.querySelector('.preview-stage');
  if (!inner || !stage) return [];

  const origTransform = inner.style.transform;
  const origOrigin = inner.style.transformOrigin;
  const origOverflow = stage.style.overflow;

  stage.style.overflow = 'hidden';
  inner.style.transform = 'scale(1)';
  inner.style.transformOrigin = 'top left';
  inner.offsetHeight;

  try {
    const pageEls = inner.querySelectorAll('.preview-page');
    const canvases = [];
    for (const el of pageEls) {
      canvases.push(await capturePageElement(el));
    }
    return canvases;
  } finally {
    inner.style.transform = origTransform;
    inner.style.transformOrigin = origOrigin;
    stage.style.overflow = origOverflow;
  }
}

export async function exportPNG(container) {
  const canvases = await capturePages(container);
  if (canvases.length === 0) {
    alert('未找到预览内容');
    return;
  }

  const totalHeight = canvases.reduce((h, c) => h + c.height, 0);
  const maxWidth = Math.max(...canvases.map((c) => c.width));

  const result = document.createElement('canvas');
  result.width = maxWidth;
  result.height = totalHeight;
  const ctx = result.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, result.width, result.height);

  let y = 0;
  for (const c of canvases) {
    ctx.drawImage(c, 0, y);
    y += c.height;
  }

  result.toBlob((blob) => {
    if (blob) downloadBlob(blob, 'resume.png');
  }, 'image/png');
}

export async function exportPDF(container, paperSizeMM) {
  const canvases = await capturePages(container);
  if (canvases.length === 0) {
    alert('未找到预览内容');
    return;
  }

  const { jsPDF } = await import('jspdf');

  const [pageW, pageH] = [paperSizeMM.width, paperSizeMM.height];
  const pdf = new jsPDF({ unit: 'mm', format: [pageW, pageH] });

  canvases.forEach((canvas, i) => {
    if (i > 0) pdf.addPage([pageW, pageH]);
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH);
  });

  pdf.save('resume.pdf');
}

export async function exportJSON(data) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, 'resume.json');
}
