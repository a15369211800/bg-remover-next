export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  google_id: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

// D1 database binding via Cloudflare Pages
// The DB binding is injected via wrangler.toml / Cloudflare Pages settings
declare global {
  const DB: D1Database;
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
  const result = await db.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();
  return result as User | null;
}

export async function createUser(db: D1Database, data: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  google_id: string;
}): Promise<User> {
  await db.prepare(
    'INSERT OR IGNORE INTO users (id, email, name, image, google_id, credits) VALUES (?, ?, ?, ?, ?, 2)'
  ).bind(data.id, data.email, data.name, data.image, data.google_id).run();

  const user = await getUserByEmail(db, data.email);
  if (!user) throw new Error('Failed to create user');
  return user;
}

export async function updateUserCredits(db: D1Database, userId: string, credits: number): Promise<void> {
  await db.prepare(
    'UPDATE users SET credits = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(credits, userId).run();
}
