
import { NextRequest, NextResponse } from 'next/server';
import { createAvatarConfig, getAvatarConfig, updateAvatarConfig } from '@/services/chatService';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const config = await getAvatarConfig(userId);
    return NextResponse.json({ config });

  } catch (error) {
    console.error('Get avatar config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const configData = await request.json();
    const configId = await createAvatarConfig(configData);
    return NextResponse.json({ configId });

  } catch (error) {
    console.error('Create avatar config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { configId, ...updates } = await request.json();

    if (!configId) {
      return NextResponse.json(
        { error: 'Config ID is required' },
        { status: 400 }
      );
    }

    await updateAvatarConfig(configId, updates);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Update avatar config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
