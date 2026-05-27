import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false, tone = 'default' }: { user: User; showEmail?: boolean; tone?: 'default' | 'sidebar' }) {
    const getInitials = useInitials();
    const nameClass = tone === 'sidebar' ? 'text-white' : 'text-foreground';
    const emailClass = tone === 'sidebar' ? 'text-white/70' : 'text-muted-foreground';

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className={`truncate font-medium ${nameClass}`}>{user.name}</span>
                {showEmail && <span className={`truncate text-xs ${emailClass}`}>{user.email}</span>}
            </div>
        </>
    );
}
