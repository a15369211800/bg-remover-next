import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // @ts-ignore - DB is injected by Cloudflare D1 binding
    const db: D1Database = (process.env as any).DB || (globalThis as any).DB;
    
    if (!db) {
      return NextResponse.json({ credits: 2 }); // Default if DB not available
    }

    const user = await db.prepare(
      'SELECT credits FROM users WHERE email = ?'
    ).bind(email).first();

    return NextResponse.json({ credits: user ? (user as any).credits : 2 });
  } catch (error) {
    console.error('Credits error:', error);
    return NextResponse.json({ credits: 2 });
  }
}
