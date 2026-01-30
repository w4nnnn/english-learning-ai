import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfileClient } from '@/components/profile/profile-client';
import { getUserProgress } from '@/lib/actions/user-progress';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/login');
    }

    const userId = session.user.id as string;
    if (!userId) {
        redirect('/login');
    }

    const userProgress = await getUserProgress(userId);

    return (
        <ProfileClient
            userName={session.user.name || 'User'}
            userRole={session.user.role || 'murid'}
            xp={userProgress?.xp || 0}
            heartCount={userProgress?.heartCount || 5}
            streak={userProgress?.streak || 0}
        />
    );
}
