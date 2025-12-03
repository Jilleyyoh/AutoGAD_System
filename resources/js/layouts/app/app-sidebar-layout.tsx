import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}

// In the AppSidebar component, update the active link styling
const activeLinkStyle = 
          active 
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold' 
          : 'text-gray-700 dark:text-gray-300';

// className={cn(
//         'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800',
//         active ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold' : 'text-gray-700 dark:text-gray-300'
//       )}
