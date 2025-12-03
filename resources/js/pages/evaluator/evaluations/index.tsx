import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Search, FileText, Calendar, Clock, Eye, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { themeClasses, combineTheme } from '@/lib/theme-classes';

interface Project {
    id: number;
    project_code: string;
    title: string;
    organization: string;
    domain: string;
    phase: string;
    submission_date: string;
    status: string;
    status_id: number;
    revision_count?: number;
    evaluation?: {
        id: number;
        status_id: number;
        has_progress: boolean;
    } | null;
}

interface Props {
    projects: Project[];
    currentStatus: string;
    searchQuery: string;
    highlightProjectId?: number;
    error?: string;
}

export default function Index({ projects, currentStatus = 'all', searchQuery = '', highlightProjectId, error }: Props) {
    // Seed active status and date filters from URL so filters persist across reloads
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const initialStatus = urlParams.get('status') || currentStatus || 'all';
    const [activeStatus, setActiveStatus] = useState(initialStatus);
    const [search, setSearch] = useState(searchQuery);
    const [localFilters, setLocalFilters] = useState<{ from?: string; to?: string }>({
        from: urlParams.get('from') ?? undefined,
        to: urlParams.get('to') ?? undefined,
    });

    // Scroll and highlight effect
    useEffect(() => {
        if (highlightProjectId) {
            const element = document.querySelector(`tr[data-project-id="${highlightProjectId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [highlightProjectId]);

    // Prefer status_name when available; fall back to numeric status_id mapping
    const getStatusCounts = () => {
        const normalize = (s?: string) => (s || '').toString().toLowerCase();
        return {
            all: projects.length,
            for_evaluation: projects.filter(p => normalize((p as any).status) === 'for_evaluation' || p.status_id === 1).length,
            revision: projects.filter(p => ['revision','revised','revision'].includes(normalize((p as any).status)) || p.status_id === 2).length,
            approved: projects.filter(p => normalize((p as any).status) === 'approved' || normalize((p as any).status) === 'completed' || p.status_id === 3).length,
            declined: projects.filter(p => normalize((p as any).status) === 'declined' || p.status_id === 4).length,
            review: projects.filter(p => normalize((p as any).status) === 'review' || p.status_id === 6).length,
            for_certification: projects.filter(p => normalize((p as any).status) === 'for_certification' || p.status_id === 5).length,
            certified: projects.filter(p => normalize((p as any).status) === 'certified' || p.status_id === 7).length,
        };
    };

    const counts = getStatusCounts();

    const statusTabs = [
        { key: 'all', label: 'All', count: counts.all },
        { key: 'for_evaluation', label: 'For Evaluation', count: counts.for_evaluation },
        { key: 'revision', label: 'Revision', count: counts.revision },
        { key: 'approved', label: 'Approved', count: counts.approved },
        { key: 'declined', label: 'Declined', count: counts.declined },
        { key: 'review', label: 'In Review', count: counts.review },
        { key: 'for_certification', label: 'For Certification', count: counts.for_certification },
        { key: 'certified', label: 'Certified', count: counts.certified },
    ];

    const getStatusColorAndIcon = (statusKey: string) => {
        switch (statusKey) {
            case 'for_evaluation':
                return { color: 'blue', icon: Clock, bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800' };
            case 'revision':
                return { color: 'yellow', icon: AlertCircle, bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800' };
            case 'approved':
                return { color: 'green', icon: CheckCircle2, bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800' };
            case 'declined':
                return { color: 'red', icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800' };
            case 'review':
                return { color: 'orange', icon: Eye, bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-800' };
            case 'for_certification':
                return { color: 'indigo', icon: Clock, bg: 'bg-indigo-50 dark:bg-indigo-900/10', border: 'border-indigo-200 dark:border-indigo-800' };
            case 'certified':
                return { color: 'purple', icon: CheckCircle2, bg: 'bg-purple-50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-800' };
            default:
                return { color: 'gray', icon: Eye, bg: 'bg-gray-50 dark:bg-gray-900/10', border: 'border-gray-200 dark:border-gray-800' };
        }
    };

    const applyStatusFilter = (items: Project[]) => {
        if (activeStatus === 'all') return items;
        const normalize = (s?: string) => (s || '').toString().toLowerCase();

        if (activeStatus === 'for_evaluation') {
            return items.filter(p => normalize((p as any).status) === 'for_evaluation' || p.status_id === 1);
        }

        if (activeStatus === 'revision') {
            return items.filter(p => ['revision','revised','revision'].includes(normalize((p as any).status)) || p.status_id === 2);
        }

        if (activeStatus === 'approved') {
            return items.filter(p => normalize((p as any).status) === 'approved' || normalize((p as any).status) === 'completed' || p.status_id === 3);
        }

        if (activeStatus === 'declined') {
            return items.filter(p => normalize((p as any).status) === 'declined' || p.status_id === 4);
        }

        if (activeStatus === 'review') {
            return items.filter(p => normalize((p as any).status) === 'review' || p.status_id === 6);
        }

        if (activeStatus === 'for_certification') {
            return items.filter(p => normalize((p as any).status) === 'for_certification' || p.status_id === 5);
        }

        if (activeStatus === 'certified') {
            return items.filter(p => normalize((p as any).status) === 'certified' || p.status_id === 7);
        }

        return items;
    };

    // Date filtering & apply behavior (redirect to server with query params)
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (activeStatus && activeStatus !== 'all') params.set('status', activeStatus);
        if (localFilters.from) params.set('from', localFilters.from);
        if (localFilters.to) params.set('to', localFilters.to);
        window.location.href = route('evaluator.evaluations.index') + (params.toString() ? '?' + params.toString() : '');
    };

    const filteredProjects = applyStatusFilter(
        search
            ? projects.filter(p =>
                p.project_code.toLowerCase().includes(search.toLowerCase()) ||
                p.title.toLowerCase().includes(search.toLowerCase())
            )
            : projects
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('evaluator.dashboard') }, { title: 'Evaluations', href: route('evaluator.evaluations.index') }]}>
            <Head title="Evaluations" />

            <div className="min-h-screen bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className={combineTheme('text-3xl font-bold', themeClasses.text.primary)}>
                            Evaluations
                        </h1>
                        <p className={combineTheme('mt-2', themeClasses.text.secondary)}>
                            Projects assigned for evaluation
                        </p>
                    </div>

                    {/* Info Card */}
                    <div className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                        <div className="flex gap-3">
                             <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">About Evaluations</h3>
                                <p className="text-sm text-indigo-800 dark:text-indigo-200 mt-1">
                                    Evaluations allow you to review and assess submitted projects. Track your evaluation progress, provide feedback, and contribute to the approval process.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={combineTheme('mb-4 p-4 border rounded', themeClasses.alert.error)}>
                            {error}
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className={combineTheme('absolute left-3 top-3 w-5 h-5', themeClasses.icon.muted)} />
                            <input
                                type="text"
                                placeholder="Search by project code or title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={combineTheme('w-full pl-10 pr-4 py-2 rounded-lg', themeClasses.input.base, themeClasses.input.focus, themeClasses.input.placeholder)}
                            />
                        </div>
                    </div>

                    {/* Date range filters */}
                    <div className={combineTheme('p-6 shadow-sm rounded-lg border mb-6', themeClasses.card.base)}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className={combineTheme('w-5 h-5', themeClasses.icon.primary)} />
                                <h2 className={combineTheme('text-lg font-semibold', themeClasses.text.primary)}>Refine by Date (Optional)</h2>
                            </div>
                            {(localFilters.from || localFilters.to) && (
                                <button
                                    onClick={() => {
                                        setLocalFilters({ from: undefined, to: undefined });
                                        const params = new URLSearchParams();
                                        if (activeStatus && activeStatus !== 'all') params.set('status', activeStatus);
                                        window.location.href = route('evaluator.evaluations.index') + (params.toString() ? '?' + params.toString() : '');
                                    }}
                                    className={combineTheme('text-sm px-3 py-1 rounded-md', themeClasses.button.secondary)}
                                >
                                    <X className="w-4 h-4 inline mr-1" />
                                    Clear Dates
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>Start Date</label>
                                <input
                                    type="date"
                                    value={localFilters.from || ''}
                                    onChange={e => setLocalFilters({ ...localFilters, from: e.target.value || undefined })}
                                    className={combineTheme('block w-full px-4 py-2 rounded-lg border text-sm appearance-none cursor-pointer', themeClasses.input.base, themeClasses.input.focus)}
                                />
                            </div>

                            <div>
                                <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>End Date</label>
                                <input
                                    type="date"
                                    value={localFilters.to || ''}
                                    onChange={e => setLocalFilters({ ...localFilters, to: e.target.value || undefined })}
                                    className={combineTheme('block w-full px-4 py-2 rounded-lg border text-sm appearance-none cursor-pointer', themeClasses.input.base, themeClasses.input.focus)}
                                />
                            </div>

                            <div className="md:col-span-1 lg:col-span-1 flex items-end">
                                <div className={combineTheme('w-full px-4 py-2 rounded-lg text-sm font-medium text-center', themeClasses.text.tertiary)}>
                                    {localFilters.from && localFilters.to ? (
                                        `${Math.ceil((new Date(localFilters.to).getTime() - new Date(localFilters.from).getTime()) / (1000 * 60 * 60 * 24)) + 1} days`
                                    ) : (
                                        'Date range optional'
                                    )}
                                </div>
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className={combineTheme('w-full px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-all', themeClasses.button.primary)}
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Status Tabs */}
                    <div className={combineTheme('mb-6 rounded-lg border shadow-sm', themeClasses.card.base)}>
                        <div className="flex flex-wrap justify-center gap-1 p-2 lg:gap-2 lg:p-3">
                            {statusTabs.map((tab) => {
                                const { color, icon: TabIcon, bg, border } = getStatusColorAndIcon(tab.key);
                                const isActive = activeStatus === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveStatus(tab.key)}
                                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md font-medium text-xs transition-all duration-200 ${
                                            isActive
                                                ? `${bg} ${border} border-2 text-${color}-700 dark:text-${color}-300 shadow-md`
                                                : combineTheme('text-gray-600 hover:text-gray-900 border border-transparent', themeClasses.text.secondary, 'dark:hover:text-gray-300')
                                        }`}
                                    >
                                        <TabIcon className="w-3.5 h-3.5" />
                                        <span>{tab.label}</span>
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                                            isActive
                                                ? `${color === 'blue' ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' : 
                                                   color === 'green' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' :
                                                   color === 'red' ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' :
                                                   color === 'purple' ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200' :
                                                   color === 'amber' ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200' :
                                                   color === 'indigo' ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200' :
                                                   'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`
                                                : combineTheme('bg-gray-100 text-gray-600', 'dark:bg-slate-700 dark:text-gray-400')
                                        }`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Projects Table */}
                    <div className={combineTheme('shadow-md rounded-lg overflow-hidden', themeClasses.card.base)}>
                        {filteredProjects.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className={combineTheme('min-w-full divide-y', themeClasses.table.border)}>
                                    <thead className={themeClasses.table.header}>
                                        <tr>
                                            <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>
                                                Project Code
                                            </th>
                                            <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>
                                                Title
                                            </th>
                                            <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>
                                                Organization
                                            </th>
                                            <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>
                                                Domain
                                            </th>
                                            <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>
                                                Phase
                                            </th>
                                            <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>
                                                Submission Date
                                            </th>
                                            <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>
                                                Status
                                            </th>
                                            <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className={combineTheme('divide-y', themeClasses.table.body, themeClasses.table.border)}>
                                        {filteredProjects.map((project) => {
                                            const isHighlighted = highlightProjectId && project.id === highlightProjectId;
                                            return (
                                            <tr 
                                                key={project.id} 
                                                data-project-id={project.id}
                                                className={combineTheme('transition-colors',
                                                    isHighlighted 
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 shadow-md'
                                                        : themeClasses.table.row
                                                )}
                                            >
                                                <td className={combineTheme('px-6 py-4 whitespace-nowrap text-sm font-medium', themeClasses.text.primary)}>
                                                    {project.project_code}
                                                </td>
                                                <td className={combineTheme('px-6 py-4 text-sm', themeClasses.text.secondary)}>
                                                    <div className="max-w-xs truncate" title={project.title}>
                                                        {project.title}
                                                    </div>
                                                </td>
                                                <td className={combineTheme('px-6 py-4 whitespace-nowrap text-sm', themeClasses.text.secondary)}>
                                                    {project.organization}
                                                </td>
                                                <td className={combineTheme('px-6 py-4 whitespace-nowrap text-sm', themeClasses.text.secondary)}>
                                                    {project.domain}
                                                </td>
                                                <td className={combineTheme('px-6 py-4 whitespace-nowrap text-sm', themeClasses.text.secondary)}>
                                                    {project.phase}
                                                </td>
                                                <td className={combineTheme('px-6 py-4 whitespace-nowrap text-sm', themeClasses.text.secondary)}>
                                                    {project.submission_date}
                                                </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {(() => {
                                                                const statusKey = String(project.status || '').toLowerCase();
                                                                const { color, icon: StatusIcon, bg, border } = getStatusColorAndIcon(statusKey);
                                                                return (
                                                                    <span className={combineTheme('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold', bg, border, 'border')}>
                                                                        <StatusIcon className="w-3 h-3" />
                                                                        {statusKey ? statusKey.split('_').map((word, idx) => 
                                                                            word.charAt(0).toUpperCase() + word.slice(1)
                                                                        ).join(' ') : 'Unknown'}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {(() => {
                                                                const normalized = project.status === 'certified' ? 'completed' : String(project.status || '').toLowerCase();

                                                                // Declined -> View
                                                                if (normalized === 'declined' || project.status_id === 4) {
                                                                    return (
                                                                        <Link
                                                                            href={`/evaluator/evaluations/${project.id}`}
                                                                            className={combineTheme('inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm', themeClasses.button.secondary)}
                                                                        >
                                                                            <FileText className="w-4 h-4 mr-2" />
                                                                            View
                                                                        </Link>
                                                                    );
                                                                }

                                                                // For Certification -> View
                                                                if (normalized === 'for_certification' || project.status_id === 5) {
                                                                    return (
                                                                        <Link
                                                                            href={`/evaluator/evaluations/${project.id}`}
                                                                            className={combineTheme('inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm', themeClasses.button.secondary)}
                                                                        >
                                                                            <FileText className="w-4 h-4 mr-2" />
                                                                            View
                                                                        </Link>
                                                                    );
                                                                }

                                                                // Completed/Approved -> View (new IDs: 3=approved, 7=certified)
                                                                if (['approved', 'completed'].includes(normalized) || [3, 7].includes(project.status_id)) {
                                                                    return (
                                                                        <Link
                                                                            href={`/evaluator/evaluations/${project.id}`}
                                                                            className={combineTheme('inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm', themeClasses.button.secondary)}
                                                                        >
                                                                            <FileText className="w-4 h-4 mr-2" />
                                                                            View
                                                                        </Link>
                                                                    );
                                                                }

                                                                // Revisions -> Re-Evaluate (enabled only when 'revised')
                                                                if (['revision', 'revised', 'revision'].includes(normalized) || project.status_id === 2) {
                                                                    const isEnabled = normalized === 'revised' || String(project.status || '').toLowerCase() === 'revised';
                                                                    return (
                                                                        <button
                                                                            onClick={() => { if (isEnabled) { window.location.href = `/evaluator/evaluations/${project.id}`; } }}
                                                                            disabled={!isEnabled}
                                                                            className={combineTheme(`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${isEnabled ? '' : 'opacity-50 cursor-not-allowed'}`, isEnabled ? themeClasses.button.primary : themeClasses.button.secondary)}
                                                                        >
                                                                            <FileText className="w-4 h-4 mr-2" />
                                                                            Re-Evaluate
                                                                        </button>
                                                                    );
                                                                }

                                                                // If there's an evaluation record with saved progress
                                                                if (project.evaluation && project.evaluation.has_progress) {
                                                                    // Check if this is a re-evaluation after revision (revision_count > 0)
                                                                    const wasRevised = project.revision_count && project.revision_count > 0;
                                                                    
                                                                    return (
                                                                        <Link
                                                                            href={`/evaluator/evaluations/${project.id}`}
                                                                            className={combineTheme('inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white', themeClasses.button.primary)}
                                                                        >
                                                                            <FileText className="w-4 h-4 mr-2" />
                                                                            {wasRevised ? 'Re-Evaluate' : 'Continue Evaluation'}
                                                                        </Link>
                                                                    );
                                                                }

                                                                // Default: new (not-yet-started) or pending -> Evaluate
                                                                return (
                                                                    <Link
                                                                        href={`/evaluator/evaluations/${project.id}`}
                                                                        className={combineTheme('inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white', themeClasses.button.primary)}
                                                                    >
                                                                        <FileText className="w-4 h-4 mr-2" />
                                                                        Evaluate
                                                                    </Link>
                                                                );
                                                            })()}
                                                        </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className={combineTheme('px-6 py-12 text-center', themeClasses.text.tertiary)}>
                                <p className="text-lg">No projects found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
