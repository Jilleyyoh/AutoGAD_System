import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Eye, ChevronLeft, Clock, AlertCircle, CheckCircle2, XCircle, FileText, BarChart3 } from 'lucide-react';
import { route } from 'ziggy-js';

interface EvaluationItem {
    id: number;
    project_id?: number;
    project_code: string;
    title: string;
    organization: string;
    domain: string;
    phase: string;
    evaluator_name: string;
    evaluator_email?: string | null;
    total_score?: number | null;
    completion_date?: string | null;
    questionnaire_version?: string | null;
    status: string;
    admin2_remarks?: string | null;
}

interface Props {
    evaluations: EvaluationItem[];
    pagination: {
        total: number;
        current_page: number;
        last_page: number;
    };
}

export default function Index({ evaluations, pagination }: Props) {
    const [search, setSearch] = useState('');

    // Filter evaluations based on search
    const filteredEvaluations = evaluations.filter(item =>
        item.project_code.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.evaluator_name.toLowerCase().includes(search.toLowerCase())
    );

    // Get completion badge color
    const getCompletionBadge = (completed: number, total: number) => {
        if (completed === total) {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">All Completed</span>;
        } else if (completed === 0) {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">Pending</span>;
        } else {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">In Progress</span>;
        }
    };

    // Get score badge with interpretation-based thresholds
    const getScoreBadge = (score?: number | null) => {
        if (score === undefined || score === null) {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200">No Score</span>;
        }
        
        // Map score to interpretation ranges: 0-4 (red), 4-8 (orange), 8-15 (blue), 15-20+ (green)
        if (score >= 15) {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">{score.toFixed(2)}</span>;
        } else if (score >= 8) {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">{score.toFixed(2)}</span>;
        } else if (score >= 4) {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">{score.toFixed(2)}</span>;
        } else {
            return <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">{score.toFixed(2)}</span>;
        }
    };

    // Get status badge with icon - using new color scheme
    const getStatusBadge = (statusKey?: string) => {
        const statusMap: { [key: string]: { bg: string; border: string; textColor: string; icon: React.ComponentType<any> } } = {
            'for_evaluation': { bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800', textColor: 'text-blue-700 dark:text-blue-300', icon: Clock },
            'revision': { bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', textColor: 'text-yellow-700 dark:text-yellow-300', icon: AlertCircle },
            'approved': { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800', textColor: 'text-green-700 dark:text-green-300', icon: CheckCircle2 },
            'declined': { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800', textColor: 'text-red-700 dark:text-red-300', icon: XCircle },
            'review': { bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-800', textColor: 'text-orange-700 dark:text-orange-300', icon: Eye },
            'for_certification': { bg: 'bg-indigo-50 dark:bg-indigo-900/10', border: 'border-indigo-200 dark:border-indigo-800', textColor: 'text-indigo-700 dark:text-indigo-300', icon: Clock },
            'certified': { bg: 'bg-purple-50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-800', textColor: 'text-purple-700 dark:text-purple-300', icon: CheckCircle2 },
        };

        const status = statusMap[statusKey || ''] || { bg: 'bg-gray-50 dark:bg-gray-900/10', border: 'border-gray-200 dark:border-gray-800', textColor: 'text-gray-700 dark:text-gray-300', icon: Eye };
        const StatusIcon = status.icon;

        const statusLabels: { [key: string]: string } = {
            'for_evaluation': 'For Evaluation',
            'revision': 'Revision',
            'approved': 'Approved',
            'declined': 'Declined',
            'review': 'In Review',
            'for_certification': 'For Certification',
            'certified': 'Certified',
        };

        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${status.bg} ${status.border} ${status.textColor}`}>
                <StatusIcon className="w-4 h-4" />
                {statusLabels[statusKey || ''] || statusKey || 'Unknown'}
            </span>
        );
    };

    // compute quick stats from evaluations
    const totalEvaluations = evaluations.length;
    const avgScore = totalEvaluations > 0
        ? (evaluations.reduce((sum, e) => sum + (e.total_score || 0), 0) / totalEvaluations)
        : null;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin2.dashboard') },
                { title: 'Evaluations', href: route('admin2.evaluations.index') },
            ]}
            sidebarOpen={false}
        >
            <Head title="Manage Evaluations" />

            <div className="min-h-screen bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Evaluations</h1>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">Review and consolidate completed project evaluations</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="mb-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">About Evaluations</h3>
                                <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">
                                    Evaluations are assessments of completed projects by assigned evaluators, providing scores and feedback for certification.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search Projects
                        </label>
                        <input
                            type="text"
                            placeholder="Search by project code or title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Total Projects</p>
                                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{pagination.total}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Completed Evaluations</p>
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                                {totalEvaluations}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Pending Consolidation</p>
                                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                                {0}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Avg Score</p>
                                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                {avgScore !== null
                                    ? avgScore.toFixed(2)
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Projects Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md overflow-x-auto">
                        {filteredEvaluations.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Organization</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Evaluator</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[250px]">Admin 2 Remarks</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Completed</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredEvaluations.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">{item.project_code}</td>
                                            <td className="px-6 py-4 text-sm max-w-xs truncate text-gray-900 dark:text-white">{item.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.organization}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.evaluator_name}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {getScoreBadge(item.total_score)}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4 text-sm max-w-xs truncate text-gray-600 dark:text-gray-400">
                                                {item.admin2_remarks ? (
                                                    <span title={item.admin2_remarks} className="cursor-help">
                                                        {item.admin2_remarks.substring(0, 50)}
                                                        {item.admin2_remarks.length > 50 ? '...' : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-600">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.completion_date ? item.completion_date : '—'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {item.status === 'review' ? (
                                                    <span className="inline-flex items-center gap-2 font-medium opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600">
                                                        <Eye className="w-4 h-4" />
                                                        Awaiting Evaluator
                                                    </span>
                                                ) : (
                                                    <Link
                                                        href={`/admin2/evaluations/${item.project_id}/review`}
                                                        className="inline-flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Review
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p>No evaluations found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
