import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { FileText, ArrowRight, ClipboardList, Award, Bell } from 'lucide-react';
import { themeClasses, combineTheme } from '@/lib/theme-classes';
import { route } from 'ziggy-js';

interface Stats {
    pending: number;
    completed: number;
    total: number;
}

interface Evaluator {
    id: number;
    name: string;
    email: string;
    title: string;
    domain_expertise: string;
}

interface Props {
    evaluator: Evaluator;
    stats: Stats;
}

const accessItems = [
    {
        title: 'My Evaluations',
        description: 'View assigned projects and start evaluations',
        icon: ClipboardList,
        href: route('evaluator.evaluations.index'),
        color: 'blue',
        accent: 'from-blue-500 to-blue-600',
    },
    {
        title: 'Pending Evaluations',
        description: 'Focus on items awaiting your review',
        icon: FileText,
        href: '/evaluator/evaluations?status=pending',
        color: 'emerald',
        accent: 'from-emerald-500 to-emerald-600',
    },
    {
        title: 'Certificates',
        description: 'Access certificates for evaluated projects',
        icon: Award,
        href: route('evaluator.certificates.index'),
        color: 'purple',
        accent: 'from-purple-500 to-purple-600',
    },
    {
        title: 'Notifications',
        description: 'Check updates and system notices',
        icon: Bell,
        href: route('evaluator.notifications.index'),
        color: 'orange',
        accent: 'from-orange-500 to-orange-600',
    },
];

export default function Dashboard({ evaluator, stats }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('evaluator.dashboard') }]}>
            <Head title="Evaluator Dashboard" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className={combineTheme('px-4 sm:px-0', themeClasses.text.primary)}>
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className={combineTheme('text-3xl font-bold', themeClasses.text.primary)}>
                                Dashboard
                            </h2>
                            <p className={combineTheme('mt-2 max-w-3xl', themeClasses.text.secondary)}>
                                Review assigned projects, complete evaluations with scores and remarks, and monitor your progress through submission.
                            </p>
                        </div>
                        <Link
                            href="/evaluator/evaluations"
                            className="flex items-center gap-2 border px-6 py-3 transition-colors bg-[#5a189a] text-white hover:bg-[#4a0e7a]"
                        >
                            <FileText className="w-5 h-5" />
                            Go to Evaluations
                        </Link>
                    </div>

                    {/* Evaluator Profile Card */}
                    <div className={combineTheme('overflow-hidden mb-8 border', themeClasses.card.base)}>
                        <div className={combineTheme('p-8 border-b flex items-start justify-between', themeClasses.border.primary)}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={combineTheme('px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider', themeClasses.badge.green)}>
                                        Evaluator
                                    </span>
                                </div>
                                <h1 className={combineTheme('text-3xl font-bold', themeClasses.text.primary)}>
                                    {evaluator.name}
                                </h1>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Domain Expertise</p>
                                        <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{evaluator.domain_expertise}</p>
                                    </div>
                                    <div>
                                        <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Email</p>
                                        <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{evaluator.email}</p>
                                    </div>
                                    <div>
                                        <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Title</p>
                                        <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{evaluator.title}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Pending Evaluations */}
                        <div className={combineTheme('border p-6', themeClasses.card.base)}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>
                                        Pending Evaluations
                                    </p>
                                    <p className={combineTheme('text-3xl font-bold mt-2', themeClasses.text.primary)}>
                                        {stats.pending}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Completed Evaluations */}
                        <div className={combineTheme('border p-6', themeClasses.card.base)}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>
                                        Completed Evaluations
                                    </p>
                                    <p className={combineTheme('text-3xl font-bold mt-2', themeClasses.text.primary)}>
                                        {stats.completed}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total Assigned */}
                        <div className={combineTheme('border p-6', themeClasses.card.base)}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>
                                        Total Assigned
                                    </p>
                                    <p className={combineTheme('text-3xl font-bold mt-2', themeClasses.text.primary)}>
                                        {stats.total}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Access Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {accessItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="group relative overflow-hidden bg-white dark:bg-gray-900 transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                    <div className="relative p-6 flex flex-col h-full">
                                        <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300 ${
                                            item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                            item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                            item.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                            'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                        }`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                                            {item.description}
                                        </p>
                                        <div className="flex items-center text-[#5a189a] dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                                            Access <ArrowRight className="w-4 h-4 ml-2" />
                                        </div>
                                    </div>

                                    <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${item.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
