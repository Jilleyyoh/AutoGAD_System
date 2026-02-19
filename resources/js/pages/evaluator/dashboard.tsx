import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { CheckCircle2, Clock, AlertCircle, FileText, BarChart3, Badge, Mail } from 'lucide-react';
import { themeClasses, combineTheme } from '@/lib/theme-classes';

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

export default function Dashboard({ evaluator, stats }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('evaluator.dashboard') }]}>
            <Head title="Evaluator Dashboard" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className={combineTheme('px-4 sm:px-0', themeClasses.text.primary)}>
                    {/* Evaluator Profile Card */}
                    <div className={combineTheme('overflow-hidden shadow-md sm:rounded-lg mb-8 border', themeClasses.card.base)}>
                        <div className={combineTheme('p-8 border-b flex items-start justify-between', themeClasses.border.primary)}>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge className={combineTheme('w-6 h-6 p-1 rounded-full', themeClasses.badge.blue)} />
                                    <span className={combineTheme('px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider', themeClasses.badge.green)}>
                                        Evaluator
                                    </span>
                                </div>
                                <h1 className={combineTheme('text-3xl font-bold', themeClasses.text.primary)}>
                                    {evaluator.name}
                                </h1>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Badge className={combineTheme('w-5 h-5', themeClasses.icon.muted)} />
                                        <div>
                                            <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Domain Expertise</p>
                                            <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{evaluator.domain_expertise}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className={combineTheme('w-5 h-5', themeClasses.icon.muted)} />
                                        <div>
                                            <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Email</p>
                                            <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{evaluator.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className={combineTheme('w-5 h-5', themeClasses.icon.muted)} />
                                        <div>
                                            <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Title</p>
                                            <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{evaluator.title}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className={combineTheme('text-2xl font-bold', themeClasses.text.primary)}>
                                Your Evaluation Workspace
                            </h2>
                            <p className={combineTheme('mt-2', themeClasses.text.secondary)}>
                                Track and manage all your assigned project evaluations
                            </p>
                        </div>
                        <Link
                            href="/evaluator/evaluations"
                            className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors bg-[#5a189a] text-white hover:bg-[#4a0e7a]"
                        >
                            <FileText className="w-5 h-5" />
                            Go to Evaluations
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Pending Evaluations */}
                        <div className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>
                                        Pending Evaluations
                                    </p>
                                    <p className={combineTheme('text-3xl font-bold mt-2', themeClasses.text.primary)}>
                                        {stats.pending}
                                    </p>
                                </div>
                                <Clock className="w-12 h-12 text-yellow-500" />
                            </div>
                        </div>

                        {/* Completed Evaluations */}
                        <div className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>
                                        Completed Evaluations
                                    </p>
                                    <p className={combineTheme('text-3xl font-bold mt-2', themeClasses.text.primary)}>
                                        {stats.completed}
                                    </p>
                                </div>
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                        </div>

                        {/* Total Assigned */}
                        <div className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>
                                        Total Assigned
                                    </p>
                                    <p className={combineTheme('text-3xl font-bold mt-2', themeClasses.text.primary)}>
                                        {stats.total}
                                    </p>
                                </div>
                                <AlertCircle className="w-12 h-12 text-blue-500" />
                            </div>
                        </div>
                    </div>



                    {/* Info Section */}
                    <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-8">
                        <h2 className="text-lg font-semibold mb-2 text-purple-900 dark:text-purple-100">
                            Welcome to the Evaluation System
                        </h2>
                        <p className="text-purple-800 dark:text-purple-200">
                            You can now evaluate projects assigned to you. Click "My Evaluations" above to view the projects you need to evaluate, or use the questionnaire interface to provide your assessment with scores and remarks.
                        </p>
                    </div>

                    {/* Features Overview */}
                    <div>
                        <h2 className={combineTheme('text-2xl font-bold mb-4', themeClasses.text.primary)}>
                            Available Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { title: 'View Projects', desc: 'See all projects assigned to you with filtering and search', borderColor: 'border-blue-500 dark:border-blue-600' },
                                { title: 'Score Questionnaire', desc: 'Complete comprehensive evaluation questionnaires with scoring', borderColor: 'border-green-500 dark:border-green-600' },
                                { title: 'Save Progress', desc: 'Save your evaluation progress and return to complete it later', borderColor: 'border-purple-500 dark:border-purple-600' },
                                { title: 'Submit Evaluation', desc: 'Submit your completed evaluations to the admin team for review', borderColor: 'border-yellow-500 dark:border-yellow-600' },
                            ].map((feature) => (
                                <div
                                    key={feature.title}
                                    className={combineTheme('rounded-lg shadow p-4 border-l-4', themeClasses.card.base, feature.borderColor)}
                                >
                                    <h3 className={combineTheme('font-semibold mb-2', themeClasses.text.primary)}>
                                        {feature.icon} {feature.title}
                                    </h3>
                                    <p className={combineTheme('text-sm', themeClasses.text.secondary)}>
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
