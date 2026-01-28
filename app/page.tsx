import { getLessons } from '@/lib/actions/lessons';
import { seedLessons, seedUsers } from '@/lib/db/seed';
import { getSession } from '@/lib/actions/auth';
import { getUserProgress } from '@/lib/actions/user-progress';
import GameClient from '@/components/game-client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  let lessons = await getLessons();
  const userProgress = await getUserProgress(session.userId);

  if (lessons.length === 0) {
    await seedUsers();
    await seedLessons();
    lessons = await getLessons();
  }

  return <GameClient initialLessons={lessons} initialProgress={userProgress} userId={session.userId} />;
}
