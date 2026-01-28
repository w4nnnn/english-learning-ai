import { getLessons } from '@/lib/actions/lessons';
import { seedLessons, seedUsers } from '@/lib/db/seed';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserProgress } from '@/lib/actions/user-progress';
import GameClient from '@/components/game-client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  // @ts-ignore
  const userId = session.user.id;

  let lessons = await getLessons();
  const userProgress = await getUserProgress(userId);

  if (lessons.length === 0) {
    await seedUsers();
    await seedLessons();
    lessons = await getLessons();
  }

  return <GameClient initialLessons={lessons} initialProgress={userProgress} userId={userId} />;
}
