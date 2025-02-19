'use server';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema-auth';
import { gt } from 'drizzle-orm';

/**
 * Fetches users created in the last 7 days
 * @returns Array of users created within the past week
 */
export async function getRecentUsers() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentUsers = await db.select().from(user).where(gt(user.createdAt, sevenDaysAgo));

  return recentUsers.map((user) => ({
    timestamp: user.createdAt,
    users: 1, // Each entry represents a single user
  }));
}
