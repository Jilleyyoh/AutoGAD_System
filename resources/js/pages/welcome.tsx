import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, ArrowRight } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="GAD Automated Evaluation System - Gender and Development Evaluation">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col">
                {/* Navigation */}
                <nav className="flex items-center justify-between max-w-7xl mx-auto w-full px-6 py-6">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <span className="text-2xl font-bold">GAD System</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {auth.user && (
                            <Link
                                href={dashboard()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="max-w-4xl w-full text-center">
                        {/* Hero Section */}
                        <div className="mb-12">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                GAD <span className="text-blue-600 dark:text-blue-400">Automated</span> Evaluation System
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                                Streamline your Gender and Development project evaluation with our comprehensive, automated assessment platform designed for modern organizations.
                            </p>
                            {!auth.user && (
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition"
                                >
                                    Log In
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                        </div>

                        {/* Footer Watermark */}
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 px-6">
                    <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400">
                        <p>&copy; 2025 GAD Automated Evaluation System. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
