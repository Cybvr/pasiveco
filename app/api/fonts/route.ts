// /api/fonts/route.ts
import { NextResponse } from 'next/server';

const CATEGORIZED_FONTS = {
  "Sans-Serif": [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Poppins', 'Raleway', 'Ubuntu', 'Nunito', 'Fira Sans'
  ],
  "Serif": [
    'Merriweather', 'Playfair Display', 'Alegreya', 'PT Serif', 'Source Serif Pro'
  ],
  "Monospace": [
    'Roboto Mono', 'Source Code Pro', 'Fira Code', 'Courier Prime'
  ],
  "Display": [
    'Oswald', 'Bebas Neue', 'Rubik', 'Titillium Web'
  ]
};

export async function GET() {
  try {
    const API_KEY = process.env.GOOGLE_FONTS_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`
    );
    const data = await response.json();

    // Filter and categorize fonts
    const categorized = Object.entries(CATEGORIZED_FONTS).map(([category, families]) => ({
      category,
      fonts: data.items.filter((font: any) => families.includes(font.family))
    }));

    return NextResponse.json({ categories: categorized });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch fonts' }, 
      { status: 500 }
    );
  }
}