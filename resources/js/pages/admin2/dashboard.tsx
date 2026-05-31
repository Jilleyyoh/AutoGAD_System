import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle2, FileText, Mail, Users, ArrowRight } from 'lucide-react';
import { route } from 'ziggy-js';

interface Admin {
    id: number;
    name: string;
    email: string;
    title: string;
}

interface Stats {
    ready_for_consolidation: number;
    approved_for_certification: number;
    avg_consolidated_score: number | null;
}

interface Props {
    admin: Admin;
    stats: Stats;
}

const managementItems = [
    {
        title: 'Manage Evaluations',
        description: 'Review and consolidate submitted evaluations',
        icon: FileText,
        href: '/admin2/evaluations',
        color: 'blue',
        accent: 'from-blue-500 to-blue-600',
    },
    {
        title: 'Manage Certifications',
        description: 'Approve and issue certifications',
        icon: CheckCircle2,
        href: '/admin2/certifications',
        color: 'emerald',
        accent: 'from-emerald-500 to-emerald-600',
    },
    {
        title: 'Manage Proponents',
        description: 'View and manage proponent records',
        icon: Users,
        href: '/admin2/proponents',
        color: 'purple',
        accent: 'from-purple-500 to-purple-600',
    },
    {
        title: 'Messages',
        description: 'View messages from proponents',
        icon: Mail,
        href: '/admin2/conversations',
        color: 'orange',
        accent: 'from-orange-500 to-orange-600',
    },
];

export default function Dashboard({ admin, stats }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin2.dashboard') },
            ]}
            sidebarOpen={false}
        >
            <Head title="Dashboard" />

            <div className="min-h-screen bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                        <p className="mt-2 max-w-3xl text-gray-600 dark:text-gray-400">
                            Review, consolidate, and approve completed project evaluations.
                        </p>
                    </div>

                    {/* Admin Profile Card */}
                    <div className="overflow-hidden mb-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div className="p-8 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                        Admin 2
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {admin.name}
                                </h1>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{admin.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{admin.title}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Management Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {managementItems.map((item) => {
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

                    {/* Quick Setup Checklist */}
                    <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Setup Checklist</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                {
                                    step: '1',
                                    title: 'Review Evaluations',
                                    description: 'Check submitted evaluations for completeness',
                                    icon: FileText,
                                },
                                {
                                    step: '2',
                                    title: 'Consolidate Scores',
                                    description: 'Verify and compute consolidated results',
                                    icon: CheckCircle2,
                                },
                                {
                                    step: '3',
                                    title: 'Decide Outcome',
                                    description: 'Approve for certification or return for review',
                                    icon: Users,
                                },
                                {
                                    step: '4',
                                    title: 'Notify Proponents',
                                    description: 'Send results and next steps',
                                    icon: Mail,
                                },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.step} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#5a189a] text-white font-semibold text-sm">
                                                {item.step}
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
