import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { type NavItem } from '@/types';

export function NavMain({ items }: { items: NavItem[] }) {
    const { url } = usePage();
    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map(item => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={url === (typeof item.href === "string" ? item.href : item.href.url) || (item.title === 'Dashboard' && (url === '/' || url === '/dashboard' || url === '/admin1/dashboard' || url === '/admin2/dashboard' || url === '/proponent/dashboard' || url === '/evaluator/dashboard')) || (item.title === 'Manage Proponents' && url.startsWith('/admin2/proponents')) || (item.title === 'Manage Evaluations' && (url.startsWith('/admin2/evaluations') || url.startsWith('/admin2/evaluations/'))) || (item.title === 'Manage Certifications' && url.startsWith('/admin2/certifications')) || (item.title === 'Messages' && url.startsWith('/admin2/conversations'))} tooltip={item.title}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
