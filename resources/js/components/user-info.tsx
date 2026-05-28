import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false, tone = 'default' }: { user: User; showEmail?: boolean; tone?: 'default' | 'sidebar' }) {
    const getInitials = useInitials();
    const initials = getInitials(user.name);
    const nameClass = tone === 'sidebar' ? 'text-sidebar-foreground' : 'text-foreground';
    const emailClass = tone === 'sidebar' ? 'text-muted-foreground' : 'text-muted-foreground';
    const palette = [
        'bg-purple-100 text-gray-900',
        'bg-indigo-100 text-gray-900',
        'bg-pink-100 text-gray-900',
        'bg-blue-100 text-gray-900',
        'bg-emerald-100 text-gray-900',
        'bg-amber-100 text-gray-900',
        'bg-rose-100 text-gray-900',
        'bg-teal-100 text-gray-900',
    ];
    const colorIndex = initials.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % palette.length;
    const avatarColor = palette[colorIndex];

    return (
        <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 overflow-hidden border border-gray-200 dark:border-gray-800">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className={`avatar-fallback ${avatarColor} flex items-center justify-center text-center leading-none font-medium`}>
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className={`truncate font-medium ${nameClass}`}>{user.name}</span>
                {showEmail && <span className={`truncate text-xs ${emailClass}`}>{user.email}</span>}
            </div>
        </div>
    );
}
