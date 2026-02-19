import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Award, ClipboardList, FilePlus2, ListOrdered, CheckSquare, MessageSquare } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin1 = auth.user?.role?.name === 'admin1';
    const isAdmin2 = auth.user?.role?.id === 4 || auth.user?.role?.name === 'admin2';
    const isProponent = auth.user?.role?.id === 1 || auth.user?.role?.name === 'proponent';
    const isEvaluator = auth.user?.role?.id === 2 || auth.user?.role?.name === 'evaluator';

    const dashboardHref = isAdmin1 ? '/admin1/dashboard' : isAdmin2 ? '/admin2/dashboard' : isEvaluator ? '/evaluator/dashboard' : isProponent ? '/proponent/dashboard' : '/dashboard';

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboardHref, icon: LayoutGrid },
        ...(isProponent ? [
            { title: 'Submit PAP', href: route('proponent.pap.create'), icon: FilePlus2 },
            { title: 'Track Submissions', href: route('proponent.pap.submissions'), icon: ListOrdered },
            { title: 'Certificates', href: route('proponent.certificates.index'), icon: Award },
            { title: 'Messages', href: route('proponent.conversations.index'), icon: MessageSquare },
        ] : []),
        ...(isEvaluator ? [
            { title: 'My Evaluations', href: route('evaluator.evaluations.index'), icon: CheckSquare },
            { title: 'Certificates', href: route('evaluator.certificates.index'), icon: Award },
        ] : []),
        ...(isAdmin2 ? [
            { title: 'Manage Proponents', href: route('admin2.proponents.index'), icon: Users },
            { title: 'Manage Evaluations', href: route('admin2.evaluations.index'), icon: CheckSquare },
            { title: 'Manage Certifications', href: route('admin2.certifications.index'), icon: Award },
            { title: 'Messages', href: route('admin2.conversations.index'), icon: MessageSquare },
        ] : []),
        ...(isAdmin1 ? [
            { title: 'Manage Assignments', href: '/admin1/assignments', icon: CheckSquare },
            { title: 'Manage Domain Expertise', href: '/domain-expertise', icon: Award },
            { title: 'Manage Evaluators', href: '/evaluators', icon: Users },
            { title: 'Manage Questionnaire', href: '/questionnaire', icon: ClipboardList },
            { title: 'Certificates', href: '/admin1/certificates', icon: Award },
        ] : []),
    ];

    const footerNavItems: NavItem[] = [
        // {
        //     title: 'Repository',
        //     href: 'https://github.com/laravel/react-starter-kit',
        //     icon: Folder,
        // },
        // {
        //     title: 'Documentation',
        //     href: 'https://laravel.com/docs/starter-kits#react',
        //     icon: BookOpen,
        // },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
