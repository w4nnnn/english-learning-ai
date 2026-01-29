import { getUsers } from '@/lib/actions/users';
import { UsersClient } from '@/components/admin/users/users-client';

export default async function UsersPage() {
    const users = await getUsers();

    return <UsersClient initialUsers={users} />;
}
