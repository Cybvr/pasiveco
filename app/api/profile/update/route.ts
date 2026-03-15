
import { NextResponse } from 'next/server'
import { auth } from '@/lib/firebase'
import { updateProfile } from 'firebase/auth'

export async function POST(req: Request) {
  try {
    const { theme, description } = await req.json()
    const user = auth.currentUser
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await updateProfile(user, { description })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
