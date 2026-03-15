// fontLoader.ts
export const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily || typeof window === 'undefined') return null;

  const linkId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;

  // Check if link already exists
  if (document.getElementById(linkId)) return null;

  const link = document.createElement('link');
  link.id = linkId;
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;500;700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  return link;
};