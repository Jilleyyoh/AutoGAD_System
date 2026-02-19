import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/build/finisher-header.es5.min.js';
        script.onload = () => {
            new (window as any).FinisherHeader({
                  "count": 15,
                    "size": {
                      "min": 1100,
                      "max": 1800,
                      "pulse": 0.5    
                },
                "speed": {
                    "x": {
                        "min": 0.6,
                        "max": 1.2
                    },
                    "y": {
                        "min": 0.6,
                        "max": 1.2
                    }
                },
                "colors": {
                    "background": "#300B63",
                    "particles": [
                        "#300b63",
                        "#4b0082",
                        "#800080",
                        "#9932cc",
                        "#6015c9"
                    ]
                },
                "blending": "overlay",
                "opacity": {
                    "center": 0.6,
                    "edge": 0.08
                },
                "skew": 0, // Keeping horizontal movement as requested
                "className": "finisher-header",
                "shapes": [
                    "c" // Circular shapes
                ]
            });
        };
        document.head.appendChild(script);
    }, []);

    return (
        <>
            <Head title="GAD Automated Evaluation System - Gender and Development Evaluation">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-[#300B63] text-white flex flex-col relative z-10 finisher-header">
                {/* Navigation */}
                <nav className="flex items-center justify-between max-w-7xl mx-auto w-full px-6 py-6">
                    <div className="flex items-center gap-3">
                    </div>
                    <div className="flex items-center gap-4">
                        {auth.user && (
                            <Link
                                href={dashboard()}
                                className="px-6 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-lg font-semibold transition"
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
                                Gender and Development <span className="text-purple-300 dark:text-purple-200">Automated</span> Evaluation System
                            </h1>
                            <p className="text-xl text-white-400 mb-8 max-w-2xl mx-auto">
                                Streamline your Gender and Development project evaluation with our comprehensive, automated assessment platform designed for modern organizations.
                            </p>
                            {!auth.user && (
                                <Link
                                    href={login()}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-purple-400 hover:bg-purple-500 text-white rounded-lg font-semibold text-lg transition"
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
                <footer className="bg-[#300B63]/20 py-8 px-6">
                    <div className="max-w-7xl mx-auto text-center text-gray-400">
                        <p>&copy; 2025 GAD Automated Evaluation System. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
