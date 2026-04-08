import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface CloudflareEnv {
  DB: D1Database;
}

function getDB(request: NextRequest): D1Database | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (request as unknown as { env: CloudflareEnv }).env;
  return env?.DB || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email: string; name?: string; image?: string; google_id?: string };
    const { email, name, image, google_id } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const db = getDB(request);
    if (!db) {
      console.error('D1 database not bound');
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // Check if user exists
    const existing = await db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (!existing) {
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
