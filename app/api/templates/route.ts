// app/api/templates/route.ts

import { NextResponse } from 'next/server';
import { createTemplate, getUserTemplates } from '@/services/templateService';

export async function POST(request: Request) {
  try {
    const { userId, templateData } = await request.json();
    if (!userId || !templateData) {
      return NextResponse.json({ error: 'User ID and template data are required' }, { status: 400 });
    }
    const newTemplate = await createTemplate(userId, templateData);
    return NextResponse.json(newTemplate);
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }
  try {
    const templates = await getUserTemplates(userId);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

