import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle2, FileText, BarChart3, Badge, Mail, Eye, ArrowLeft, Calculator } from 'lucide-react';
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

export default function Dashboard({ admin, stats }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin2.dashboard') },
            ]}
            sidebarOpen={false}
        >
            <Head title="Admin 2 - Evaluation Management" />

            <div className="min-h-screen bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Admin Profile Card */}
                    <div className="overflow-hidden shadow-md sm:rounded-lg mb-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div className="p-8 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge className="w-6 h-6 p-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200" />
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                        Admin 2
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {admin.name}
                                </h1>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{admin.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{admin.title}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Evaluation Management</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Review, consolidate, and approve completed project evaluations</p>
                    </div>

                    {/* Quick Action Button */}
                    <div className="mb-8">
                        <Link
                            href="/admin2/evaluations"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-colors text-white bg-[#5a189a] hover:bg-[#4a0e7a] dark:bg-[#5a189a] dark:hover:bg-[#4a0e7a]"
                        >
                            <FileText className="w-5 h-5" />
                            Manage Evaluations
                        </Link>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Ready for Consolidation</p>
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.ready_for_consolidation}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Already Approved</p>
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.approved_for_certification}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Avg Consolidated Score</p>
                                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                {stats.avg_consolidated_score !== null ? stats.avg_consolidated_score.toFixed(2) : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Features Overview */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Available Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Review Results</p>
                                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">View Scores</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Access all evaluator feedback and consolidated results
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Approve Projects</p>
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Certification</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Finalize evaluations and advance to certification phase
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Return for Review</p>
                                    <ArrowLeft className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">Send Back</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Request additional review when needed
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Consolidate Scores</p>
                                    <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">Auto Compute</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Automatically calculate and verify evaluation averages
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Process Flow */}
                    <div className="mt-12 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-900/10 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 text-purple-900 dark:text-purple-100 flex items-center gap-2">Evaluation Consolidation Process</h2>
                        <div className="space-y-3 text-purple-800 dark:text-purple-200 text-sm">
                            <p>1. <strong>Review Results</strong> — View all evaluator feedback and scores for a project</p>
                            <p>2. <strong>Verify Completeness</strong> — Ensure all assigned evaluators have submitted</p>
                            <p>3. <strong>Make Decision</strong> — Approve for certification or return for review</p>
                            <p>4. <strong>Notify Stakeholders</strong> — System automatically sends notifications to proponent, evaluators, and certification team</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}