import { dashboard } from '@/routes';
import { Link } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white dark:bg-black p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={dashboard()} className="flex flex-col items-center gap-3 font-medium">
                            <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <span className="text-2xl font-bold">GAD System</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium text-gray-900 dark:text-white">{title}</h1>
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
