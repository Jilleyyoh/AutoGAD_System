import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="GIKMS">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="relative z-10 flex min-h-screen flex-col bg-background text-foreground">
                <nav className="mx-auto flex w-full max-w-7xl items-center justify-end px-6 py-6">
                    <div className="flex items-center gap-4">
                        {auth.user && (
                            <Link
                                href={dashboard()}
                                className="border border-foreground bg-foreground px-6 py-2 font-semibold text-background transition hover:bg-background hover:text-foreground"
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>
                </nav>

                <div className="flex flex-1 items-center justify-center px-6 py-12">
                    <div className="w-full max-w-4xl text-center">
                        <div className="mb-12">
                            <h1 className="mb-6 text-5xl leading-tight font-bold md:text-6xl">
                                Gender-Inclusive Knowledge Management System
                            </h1>
                            <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
                                Streamline your Gender and Development Evaluation with our comprehensive, automated assessment platform designed for modern organizations.
                            </p>
                            {!auth.user && (
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 border border-foreground bg-foreground px-8 py-3 text-lg font-semibold text-background transition hover:bg-background hover:text-foreground"
                                >
                                    Log In
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                        </div>

                    </div>
                </div>

                <footer className="border-t px-6 py-8">
                    <div className="mx-auto max-w-7xl text-center text-muted-foreground">
                        <p>&copy; 2026 Gender-Inclusive Knowledge Management System. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
