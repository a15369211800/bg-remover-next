import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { email, name, image, google_id } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // @ts-ignore - DB is injected by Cloudflare D1 binding
    const db: D1Database = (process.env as any).DB || (globalThis as any).DB;
    
    if (!db) {
      console.error('D1 database not bound');
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // Check if user exists
    const existing = await db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (!existing) {
      // Create new user
      const id = crypto.randomUUID();
      await db.prepare(
        'INSERT INTO users (id, email, name, image, google_id, credits) VALUES (?, ?, ?, ?, ?, 2)'
      ).bind(id, email, name || null, image || null, google_id || null).run();
    }

    const user = await db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Upsert error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
