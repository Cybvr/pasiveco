export interface ThemeConfig {
  id: string;
  name: string;
  backgroundColor: string;
  buttonColor: string;
  textColor: string;
  fontFamily?: string;
  buttonStyle?: 'none' | 'rounded-md' | 'rounded-full' | 'outline' | '3d' | 'soft-shadow';
  backgroundImage?: string;
  overlayOpacity?: number;
}

export const defaultThemes: ThemeConfig[] = [
  {
    id: 'modern',
    name: 'Modern',
    backgroundColor: '#ffffff',
    buttonColor: '#000000',
    textColor: '#333333',
    buttonStyle: 'rounded-md',
    fontFamily: 'Inter'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    backgroundColor: '#f5f5f5',
    buttonColor: '#2d3748',
    textColor: '#1a202c',
    buttonStyle: 'rounded-full',
    fontFamily: 'Roboto'
  },
  {
    id: 'bold',
    name: 'Bold',
    backgroundColor: '#000000',
    buttonColor: '#ffffff',
    textColor: '#ffffff',
    buttonStyle: '3d',
    fontFamily: 'Montserrat'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    backgroundColor: '#f0e6d9',
    buttonColor: '#8b7e74',
    textColor: '#5a4f4a',
    buttonStyle: 'soft-shadow',
    fontFamily: 'Georgia',
    backgroundImage: 'url(vintage-texture.jpg)',
    overlayOpacity: 0.5
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    backgroundColor: '#121212',
    buttonColor: '#00ffcc',
    textColor: '#ffffff',
    buttonStyle: 'outline',
    fontFamily: 'Exo',
    backgroundImage: 'url(tech-grid.png)',
    overlayOpacity: 0.3
  },
  {
    id: 'nature',
    name: 'Nature',
    backgroundColor: '#d4f1e0',
    buttonColor: '#7bbfa4',
    textColor: '#3a5a40',
    buttonStyle: 'rounded-md',
    fontFamily: 'Lora',
    backgroundImage: 'url(forest.jpg)',
    overlayOpacity: 0.4
  },
  {
    id: 'retro',
    name: 'Retro',
    backgroundColor: '#ffcc00',
    buttonColor: '#ff6600',
    textColor: '#333333',
    buttonStyle: 'rounded-full',
    fontFamily: 'Press Start 2P',
    backgroundImage: 'url(retro-pattern.png)',
    overlayOpacity: 0.6
  },
  {
    id: 'elegant',
    name: 'Elegant',
    backgroundColor: '#faf3dd',
    buttonColor: '#a07855',
    textColor: '#635147',
    buttonStyle: 'soft-shadow',
    fontFamily: 'Playfair Display',
    backgroundImage: 'url(elegant-texture.jpg)',
    overlayOpacity: 0.4
  },
  {
    id: 'playful',
    name: 'Playful',
    backgroundColor: '#ffe6e6',
    buttonColor: '#ff6666',
    textColor: '#333333',
    buttonStyle: 'rounded-md',
    fontFamily: 'Pacifico',
    backgroundImage: 'url(playful-pattern.png)',
    overlayOpacity: 0.5
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    backgroundColor: '#1e1e1e',
    buttonColor: '#ffffff',
    textColor: '#ffffff',
    buttonStyle: 'outline',
    fontFamily: 'Fira Code',
    backgroundImage: 'url(dark-texture.png)',
    overlayOpacity: 0.3
  },
  {
    id: 'pastel',
    name: 'Pastel',
    backgroundColor: '#ffe6ff',
    buttonColor: '#ffb3ff',
    textColor: '#333333',
    buttonStyle: 'rounded-full',
    fontFamily: 'Comfortaa',
    backgroundImage: 'url(pastel-pattern.png)',
    overlayOpacity: 0.4
  }
];
