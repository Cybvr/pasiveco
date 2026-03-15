// app/api/templates/[templateId]/route.ts

import { NextResponse } from 'next/server';
import { updateTemplate, deleteTemplate, getTemplate } from '@/services/templateService';

export async function GET(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const template = await getTemplate(params.templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateData } = await request.json();
    if (!templateData) {
      return NextResponse.json({ error: 'Template data is required' }, { status: 400 });
    }
    const updatedTemplate = await updateTemplate(params.templateId, templateData);
    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    await deleteTemplate(params.templateId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}