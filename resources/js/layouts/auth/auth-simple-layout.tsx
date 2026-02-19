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
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-transparent p-8 md:p-12">
            <div className="w-full max-w-md bg-[#300B63]/20 rounded-lg p-10">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={dashboard()} className="flex flex-col items-center gap-3 font-medium">
                            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium text-white">{title}</h1>
                            <p className="text-center text-sm text-white">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
