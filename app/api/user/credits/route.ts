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

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const db = getDB(request);
    if (!db) {
      return NextResponse.json({ credits: 2 });
    }

    const user = await db.prepare(
      'SELECT credits FROM users WHERE email = ?'
    ).bind(email).first<{ credits: number }>();

    return NextResponse.json({ credits: user?.credits ?? 2 });
  } catch (error) {
    console.error('Credits error:', error);
    return NextResponse.json({ credits: 2 });
  }
}
