import { verifyAdminAccess } from '@/lib/auth/admin-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Verify admin access server-side
    const isAdmin = await verifyAdminAccess(userId)

    return NextResponse.json(
      {
        isAdmin,
        message: isAdmin ? 'Admin access granted' : 'Admin access denied',
      },
      { status: isAdmin ? 200 : 403 },
    )
  } catch (error) {
    console.error('[v0] Admin verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
