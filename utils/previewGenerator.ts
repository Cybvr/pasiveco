
export const generatePreview = (title: string, bgColor: string = '#ffffff', textColor: string = '#000000'): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 1200, 630);
  
  // Title
  ctx.fillStyle = textColor;
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, 600, 315);

  return canvas.toDataURL('image/png');
};
