import { getRequestContext } from '@cloudflare/next-on-pages';

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

export async function getUserByEmail(email: string): Promise<User | null> {
  const { env } = getRequestContext();
  const result = await env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();
  return result as User | null;
}

export async function getUserByGoogleId(googleId: string): Promise<User | null> {
  const { env } = getRequestContext();
  const result = await env.DB.prepare(
    'SELECT * FROM users WHERE google_id = ?'
  ).bind(googleId).first();
  return result as User | null;
}

export async function createUser(data: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  google_id: string;
}): Promise<User> {
  const { env } = getRequestContext();
  await env.DB.prepare(
    'INSERT INTO users (id, email, name, image, google_id, credits) VALUES (?, ?, ?, ?, ?, 2)'
  ).bind(data.id, data.email, data.name, data.image, data.google_id).run();
  
  const user = await getUserByEmail(data.email);
  if (!user) throw new Error('Failed to create user');
  return user;
}

export async function updateUserCredits(userId: string, credits: number): Promise<void> {
  const { env } = getRequestContext();
  await env.DB.prepare(
    'UPDATE users SET credits = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(credits, userId).run();
}
