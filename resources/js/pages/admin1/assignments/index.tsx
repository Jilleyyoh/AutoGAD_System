import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { router } from '@inertiajs/react';
import { ProjectAssignment } from '@/types/assignments';
import AppLayout from '@/layouts/app-layout';
import { themeClasses, combineTheme } from '@/lib/theme-classes';
import AssignEvaluatorModal from './AssignEvaluatorModal';
import { Eye, CheckCircle2, AlertCircle, Clock, X, Calendar, ClipboardList } from 'lucide-react';
import axios from 'axios';

interface Props {
    projects: ProjectAssignment[];
    highlightProjectId?: number;
}

// Canonical statuses aligned with global status system
// Includes all 7 statuses: for_evaluation, revision, approved, declined, review, for_certification, certified
const CANONICAL_KEYS = ['for_evaluation', 'revision', 'approved', 'declined', 'review', 'for_certification', 'certified'];

const STATUS_LABELS: { [key: string]: string } = {
    'all': 'All',
    'for_evaluation': 'For Evaluation',
    'revision': 'Revision',
    'approved': 'Approved',
    'declined': 'Declined',
    'review': 'In Review',
    'for_certification': 'For Certification',
    'certified': 'Certified',
};

export default function Index({ projects: initialProjects, highlightProjectId }: Props) {
    const { flash } = usePage().props as any;
    const [projects, setProjects] = useState<ProjectAssignment[]>(initialProjects);
    

        // Seed active tab from URL `status` query param if present, otherwise 'all'
        // If highlighting is active, default to 'all' to ensure highlighted project is visible
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
        const initialStatus = highlightProjectId ? 'all' : (urlParams.get('status') || 'all');
        const [activeTab, setActiveTab] = useState<string>(initialStatus);
        const [localFilters, setLocalFilters] = useState<{ from?: string; to?: string }>({
            from: urlParams.get('from') ?? undefined,
            to: urlParams.get('to') ?? undefined,
        });
    const [selectedProject, setSelectedProject] = useState<ProjectAssignment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availableEvaluators, setAvailableEvaluators] = useState<any[]>([]);
    const [loadingEvaluators, setLoadingEvaluators] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const [search, setSearch] = useState('');

    const statusTabs = [
        { key: 'all', label: STATUS_LABELS['all'] },
        { key: 'for_evaluation', label: STATUS_LABELS['for_evaluation'] },
        { key: 'revision', label: STATUS_LABELS['revision'] },
        { key: 'approved', label: STATUS_LABELS['approved'] },
        { key: 'declined', label: STATUS_LABELS['declined'] },
        { key: 'review', label: STATUS_LABELS['review'] },
        { key: 'for_certification', label: STATUS_LABELS['for_certification'] },
        { key: 'certified', label: STATUS_LABELS['certified'] },
    ];

        // Status ID mapping for consecutive 1-7 system
        // 1: for_evaluation, 2: revision, 3: approved, 4: declined, 5: for_certification, 6: review, 7: certified
        const getStatusFromKey = (key: string): number | number[] | null => {
            if (key === 'all') return null;
            switch (key) {
                case 'for_evaluation': return 1;
                case 'revision': return 2;
                case 'approved': return 3;
                case 'declined': return 4;
                case 'for_certification': return 5;
                case 'review': return 6;
                case 'certified': return 7;
                default: return null;
            }
        };

    const filteredProjects = () => {
        let filtered = projects;

        // Apply status filter
        if (activeTab === 'all') {
            // No status filter
        } else {
            // Normalize some possible status_name variants
            const normalize = (s?: string) => (s || '').toString().toLowerCase();

            if (activeTab === 'revision') {
                filtered = filtered.filter(p => {
                    const name = normalize((p as any).status_name);
                    return name === 'revision' || name === 'revised' || (p.status === 2);
                });
            }

            if (activeTab === 'for_evaluation') {
                filtered = filtered.filter(p => {
                    const name = normalize((p as any).status_name);
                    return name === 'for_evaluation' || p.status === 1;
                });
            }

            if (activeTab === 'approved') {
                filtered = filtered.filter(p => {
                    const name = normalize((p as any).status_name);
                    return name === 'approved' || p.status === 3;
                });
            }

            if (activeTab === 'declined') {
                filtered = filtered.filter(p => {
                    const name = normalize((p as any).status_name);
                    return name === 'declined' || p.status === 4;
                });
            }

            if (activeTab === 'for_certification') {
                filtered = filtered.filter(p => {
                    const name = normalize((p as any).status_name);
                    return name === 'for_certification';
                });
            }

            if (activeTab === 'certified') {
                filtered = filtered.filter(p => {
                    const name = normalize((p as any).status_name);
                    return name === 'certified';
                });
            }

            // Fallback: try numeric mapping
            const statusIdOrIds = getStatusFromKey(activeTab);
            if (statusIdOrIds === null) {
                // No filter
            } else if (Array.isArray(statusIdOrIds)) {
                filtered = filtered.filter(p => statusIdOrIds.includes(p.status));
            } else {
                filtered = filtered.filter(p => p.status === statusIdOrIds);
            }
        }

        // Apply search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(project =>
                project.project_code.toLowerCase().includes(searchLower) ||
                project.title.toLowerCase().includes(searchLower) ||
                (project.proponent?.organization?.name || '').toLowerCase().includes(searchLower) ||
                (project.domainExpertise?.name || '').toLowerCase().includes(searchLower) ||
                (project.evaluator?.name || '').toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    };

    // Scroll to highlighted project when component mounts
    useEffect(() => {
        if (highlightProjectId) {
            setTimeout(() => {
                const element = document.querySelector(`tr[data-project-id="${highlightProjectId}"]`);
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }, 100); // Small delay to ensure DOM is ready
        }
    }, [highlightProjectId]);

    const handleSelectEvaluator = async (project: ProjectAssignment) => {
        setSelectedProject(project);
        setLoadingEvaluators(true);
        setErrorMessage('');

        try {
            const response = await axios.get(`/admin1/assignments/evaluators/${project.domain_id}`);
            setAvailableEvaluators(response.data);
            setIsModalOpen(true);
        } catch (error: any) {
            console.error('Error fetching evaluators:', error);
            setErrorMessage('Failed to load evaluators for this domain');
        } finally {
            setLoadingEvaluators(false);
        }
    };

    const handleViewDetails = (project: ProjectAssignment) => {
        router.visit(route('admin1.assignments.show', project.id));
    };

    const handleAssignEvaluator = async (evaluatorId: number) => {
        if (!selectedProject) return;

        try {
            const response = await axios.post('/admin1/assignments/assign', {
                project_id: selectedProject.id,
                evaluator_id: evaluatorId,
            });

            // Update the projects list with the new evaluator and status
            if (response.data.project) {
                setProjects(prevProjects => 
                    prevProjects.map(project => 
                        project.id === selectedProject.id 
                            ? {
                                ...project,
                                status: response.data.project.status,
                                evaluator: response.data.project.evaluator
                              }
                            : project
                    )
                );
            }

            setSuccessMessage('Evaluator assigned successfully!');
            setIsModalOpen(false);
            setSelectedProject(null);

            // Clear message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error: any) {
            console.error('Error assigning evaluator:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to assign evaluator');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
        }
    };

    const handleReassignToProponent = async (project: ProjectAssignment) => {
        setErrorMessage('');
        try {
            const response = await axios.post('/admin1/assignments/reassign-proponent', {
                project_id: project.id
            });

            // update local list
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: response.data.project.status, evaluator: null, status_name: response.data.project.status_name } : p));

            setSuccessMessage('Project returned to proponent for revisions');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            console.error('Failed to reassign to proponent', err);
            setErrorMessage(err?.response?.data?.message || 'Failed to reassign');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    const displayedProjects = filteredProjects();
    const statusCount = {
        all: projects.length,
        for_evaluation: projects.filter(p => ((p as any).status_name === 'for_evaluation') || p.status === 1).length,
        revision: projects.filter(p => ((p as any).status_name === 'revision' || (p as any).status_name === 'revised' || (p as any).status_name === 'revision') || p.status === 2).length,
        approved: projects.filter(p => ((p as any).status_name === 'approved') || p.status === 3).length,
        declined: projects.filter(p => ((p as any).status_name === 'declined') || p.status === 4).length,
        review: projects.filter(p => ((p as any).status_name === 'review') || p.status === 6).length,
        for_certification: projects.filter(p => ((p as any).status_name === 'for_certification') || p.status === 5).length,
        certified: projects.filter(p => ((p as any).status_name === 'certified') || p.status === 7).length,
    };

    // Debug logging
    React.useEffect(() => {
        console.log('DEBUG: Projects loaded:', projects);
        console.log('DEBUG: Active tab:', activeTab);
        console.log('DEBUG: Status ID for current tab:', getStatusFromKey(activeTab));
        console.log('DEBUG: Displayed projects:', displayedProjects);
        console.log('DEBUG: Status counts:', statusCount);
    }, [projects, activeTab]);

    // Get status color and icon - using new color scheme
    // Blue = For Evaluation, Yellow = Revision, Green = Approved, Red = Declined
    // Orange = Review, Indigo = For Certification, Purple = Certified, Gray = Unknown
    const getStatusColorAndIcon = (statusKey: string) => {
        switch (statusKey) {
            case 'for_evaluation':
                return { color: 'blue', icon: Clock, bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800' };
            case 'revision':
                return { color: 'yellow', icon: AlertCircle, bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800' };
            case 'approved':
                return { color: 'green', icon: CheckCircle2, bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800' };
            case 'declined':
                return { color: 'red', icon: X, bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800' };
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

    // Date filtering & apply behavior (redirect to server with query params)
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (activeTab && activeTab !== 'all') params.set('status', activeTab);
        if (localFilters.from) params.set('from', localFilters.from);
        if (localFilters.to) params.set('to', localFilters.to);
        window.location.href = route('admin1.assignments.index') + (params.toString() ? '?' + params.toString() : '');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
                { title: 'Assignments', href: route('admin1.assignments.index') }
            ]}
        >
            <Head title="Manage Assignments" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        Manage Assignments
                    </h1>
                    <p className={combineTheme('mt-2 max-w-2xl', themeClasses.text.secondary)}>
                        Assign evaluators to projects and track the evaluation workflow across different statuses
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className={combineTheme('mb-6 p-4 border rounded-lg flex items-center justify-between', themeClasses.alert.success)}>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>{successMessage}</span>
                        </div>
                        <button onClick={() => setSuccessMessage('')} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className={combineTheme('mb-6 p-4 border rounded-lg flex items-center justify-between', themeClasses.alert.error)}>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <span>{errorMessage}</span>
                        </div>
                        <button onClick={() => setErrorMessage('')} className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Info Card */}
                <div className="mb-8 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-900/10 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                    <div className="flex gap-3">
                         <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100">About Assignments</h3>
                            <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                                Assignments manage the workflow of project evaluations. Assign evaluators to projects, track progress through different statuses, and ensure timely completion of evaluations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Search Assignments
                    </label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by project code, title, organization, domain, or evaluator..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>

                                {/* Date Range Filters */}
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
                                                    if (activeTab && activeTab !== 'all') params.set('status', activeTab);
                                                    window.location.href = route('admin1.assignments.index') + (params.toString() ? '?' + params.toString() : '');
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
                                                style={{ backgroundColor: '#5a189a' }}
                                                className={combineTheme('w-full px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-all', themeClasses.button.primary)}
                                            >
                                                Apply Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>

                {/* Status Filter Tabs - CENTERED */}
                <div className="mb-6">
                    <div className={combineTheme('rounded-lg border shadow-sm', themeClasses.card.base)}>
                        <div className="flex flex-wrap justify-center gap-1 p-2 lg:gap-2 lg:p-3">
                            {statusTabs.map((tab) => {
                                const { color, icon: TabIcon, bg, border } = getStatusColorAndIcon(tab.key);
                                const count = statusCount[tab.key as keyof typeof statusCount];
                                const isActive = activeTab === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
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
                                                   color === 'yellow' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                                                   color === 'purple' ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200' :
                                                   color === 'orange' ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200' :
                                                   'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'}`
                                                : combineTheme('bg-gray-100 text-gray-600', 'dark:bg-slate-700 dark:text-gray-400')
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Projects Table/Grid */}
                <div className={combineTheme('shadow-md rounded-lg border overflow-hidden', themeClasses.card.base)}>
                    <div className="overflow-x-auto">
                        <table className={combineTheme('min-w-full divide-y min-h-[300px]', themeClasses.table.border)}>
                            <thead className={themeClasses.table.header}>
                                <tr>
                                    <th className={combineTheme('px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider', themeClasses.text.secondary)}>
                                        Project Code
                                    </th>
                                    <th className={combineTheme('px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider', themeClasses.text.secondary)}>
                                        Title
                                    </th>
                                    <th className={combineTheme('px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider', themeClasses.text.secondary)}>
                                        Organization
                                    </th>
                                    <th className={combineTheme('px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider', themeClasses.text.secondary)}>
                                        Domain
                                    </th>
                                    <th className={combineTheme('px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider', themeClasses.text.secondary)}>
                                        Phase
                                    </th>
                                    <th className={combineTheme('px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider', themeClasses.text.secondary)}>
                                        Submission
                                    </th>
                                    <th className={combineTheme('px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider', themeClasses.text.secondary)}>
                                        Status
                                    </th>
                                    <th className={combineTheme('px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider', themeClasses.text.secondary)}>
                                        Evaluator
                                    </th>
                                    <th className={combineTheme('px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider', themeClasses.text.secondary)}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={combineTheme('divide-y', themeClasses.table.border)}>
                                {displayedProjects.length > 0 ? (
                                    displayedProjects.map((project) => {
                                        const isHighlighted = highlightProjectId && project.id === highlightProjectId;
                                        return (
                                        <tr 
                                            key={project.id} 
                                            data-project-id={project.id}
                                            className={`${themeClasses.table.row} ${
                                                isHighlighted 
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 shadow-md' 
                                                    : ''
                                            }`}
                                        >
                                            <td className={combineTheme('px-6 py-4 whitespace-nowrap text-sm font-medium', themeClasses.text.primary)}>
                                                {isHighlighted && <span className="mr-2 px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">NEW</span>}
                                                {project.project_code}
                                            </td>
                                            <td className={combineTheme('px-6 py-4 text-sm', themeClasses.text.primary)}>
                                                <div className="max-w-xs truncate" title={project.title}>
                                                    {project.title}
                                                </div>
                                            </td>
                                            <td className={combineTheme('px-6 py-4 whitespace-nowrap text-sm', themeClasses.text.secondary)}>
                                                {project.proponent?.organization?.name ?? 'N/A'}
                                            </td>
                                            <td className={combineTheme('px-6 py-4 whitespace-nowrap text-sm', themeClasses.text.secondary)}>
                                                {project.domainExpertise?.name ?? 'N/A'}
                                            </td>
                                            <td className={combineTheme('px-6 py-4 whitespace-nowrap text-sm', themeClasses.text.secondary)}>
                                                {project.implementationPhase?.name ?? 'N/A'}
                                            </td>
                                            <td className={combineTheme('px-6 py-4 whitespace-nowrap text-sm', themeClasses.text.secondary)}>
                                                {new Date(project.submission_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {(() => {
                                                    const statusName = (project as any).status_name || '';
                                                    const { color, icon: StatusIcon, bg, border } = getStatusColorAndIcon(statusName);
                                                    return (
                                                        <span className={combineTheme('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold w-32 justify-center', bg, border, 'border')}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {STATUS_LABELS[statusName] || (statusName ? statusName.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Unknown')}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {project.evaluator ? (
                                                    <span className={combineTheme('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', themeClasses.badge.blue)}>
                                                        {project.evaluator.name}
                                                    </span>
                                                ) : (
                                                    <span className={combineTheme('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', themeClasses.badge.yellow)}>
                                                        Not Assigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(project)}
                                                        className={combineTheme('inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors', themeClasses.button.secondary)}
                                                        title="View Project Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {/* Hide/disable Assign button for terminal statuses: Declined (4), For Certification (5), Review (6), Certified (7) */}
                                                    {(() => {
                                                        if (![3,4,5,6,7].includes(project.status)) {
                                                            // If project is currently 'revision' we want to send it back to proponent
                                                            if ((project as any).status_name === 'revision') {
                                                                return (
                                                                    <button
                                                                        onClick={() => handleReassignToProponent(project)}
                                                                        disabled={loadingEvaluators}
                                                                        className={combineTheme('inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-32 justify-center', themeClasses.button.primary)}
                                                                    >
                                                                        {loadingEvaluators ? 'Processing...' : 'Reassign to Proponent'}
                                                                    </button>
                                                                );
                                                            }

                                                            if ((project as any).status_name === 'revised') {
                                                                return (
                                                                    <button
                                                                        onClick={() => handleSelectEvaluator(project)}
                                                                        disabled={loadingEvaluators}
                                                                        className={combineTheme('inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-32 justify-center', themeClasses.button.primary)}
                                                                    >
                                                                        {loadingEvaluators ? 'Loading...' : 'Reassign'}
                                                                    </button>
                                                                );
                                                            }

                                                            return (
                                                                <button
                                                                    onClick={() => handleSelectEvaluator(project)}
                                                                    disabled={loadingEvaluators}
                                                                    className={combineTheme('inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-32 justify-center', themeClasses.button.primary)}
                                                                >
                                                                    {loadingEvaluators ? 'Loading...' : 'Assign'}
                                                                </button>
                                                            );
                                                        }

                                                        return (
                                                            <span className={combineTheme('inline-flex items-center px-4 py-2 text-sm font-medium rounded-md w-32 justify-center', project.status === 4 ? themeClasses.badge.red : themeClasses.badge.green)}>
                                                                {project.status === 4 ? 'Declined' : 'Completed'}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })
                                ) : (
                                    <tr className="h-[250px]">
                                        <td colSpan={9} className="px-6 py-8 text-center align-middle">
                                            <div className={combineTheme('flex flex-col items-center justify-center h-full', themeClasses.text.secondary)}>
                                                <Clock className={combineTheme('w-12 h-12 mb-3', themeClasses.icon.muted)} />
                                                <p className={combineTheme('text-lg font-medium', themeClasses.text.primary)}>No projects in this status</p>
                                                <p className={combineTheme('text-sm mt-1', themeClasses.text.tertiary)}>Try selecting a different status filter</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Assign Evaluator Modal */}
            {selectedProject && (
                <AssignEvaluatorModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedProject(null);
                        setAvailableEvaluators([]);
                    }}
                    project={selectedProject}
                    evaluators={availableEvaluators}
                    onAssign={handleAssignEvaluator}
                    loading={loadingEvaluators}
                />
            )}
        </AppLayout>
    );
}