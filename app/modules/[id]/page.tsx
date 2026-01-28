import { getModuleWithItems } from '@/lib/actions/modules';
import { getUserModuleProgress } from '@/lib/actions/user-progress';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { ModulePlayer } from '@/components/modules/module-player';

export const dynamic = 'force-dynamic';

export default async function ModulePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect('/login');
    }

    const { id } = await params;
    const moduleData = await getModuleWithItems(id);

    if (!moduleData || !moduleData.isPublished) {
        notFound();
    }

    // @ts-ignore
    const userId = session.user.id;
    const progress = await getUserModuleProgress(userId, id);

    return (
        <ModulePlayer
            module={moduleData}
            userId={userId}
            initialProgress={progress}
        />
    );
}
