import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import DragScroll from '@/components/drag-scroll';
import { FileText, Download, Eye, AlertCircle, Award } from 'lucide-react';
import { NativeSelect } from '@/components/ui/native-select';
import { themeClasses, combineTheme } from '@/lib/theme-classes';

interface ScoreInterpretation {
    min: number;
    max: number;
    interpretation: string;
    description?: string;
}

interface Project {
    id: number;
    project_code: string;
    title: string;
    organization: string;
    domain: string;
    phase: string;
    average_score: number | null;
    status: string;
    status_id: number;
    completion_date: string;
    is_certified: boolean;
    certificate_id: number | null;
    certificate_number: string | null;
}

interface Pagination {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function CertificationsIndex({ 
    projects, 
    pagination,
    interpretations = [],
    max_score = 20
}: { 
    projects: Project[], 
    pagination: Pagination,
    interpretations?: ScoreInterpretation[],
    max_score?: number
}) {
    const { props } = usePage();
    const [loading, setLoading] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.organization.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'certified' && project.is_certified) ||
            (filterStatus === 'pending' && !project.is_certified);
        return matchesSearch && matchesStatus;
    });

    const getScoreBadgeColor = (score: number | null) => {
        if (!score) return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200';
        
        const interp = interpretations.find(
            (i) => score >= i.min && score <= i.max
        );
        
        if (!interp) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
        
        // Color code by interpretation type
        switch (interp.interpretation.toLowerCase()) {
            case 'gad is invisible in the project.':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
            case 'gad is kinda visible':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
            case 'partially implemented':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
            case 'fully implemented':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
            default:
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
        }
    };

    const getScoreInterpretation = (score: number | null): string => {
        if (!score) return 'Pending';
        
        const interp = interpretations.find(
            (i) => score >= i.min && score <= i.max
        );
        
        return interp?.interpretation || 'Unknown';
    };

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

    const pendingCount = projects.filter(p => !p.is_certified).length;
    const certifiedCount = projects.filter(p => p.is_certified).length;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Certifications', href: route('admin2.certifications.index') },
            ]}
            sidebarOpen={false}
        >
            <Head title="Manage Certifications" />

            <div className="min-h-screen bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header Section */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Manage Certifications
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Issue certificates for completed evaluation projects
                            </p>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search Projects
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by code, title, or organization..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Filter by Status
                                </label>
                                <NativeSelect
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="all">All Projects</option>
                                    <option value="pending">Pending Certification</option>
                                    <option value="certified">Certified</option>
                                </NativeSelect>
                            </div>
                        </div>
                    </div>

                    {/* Projects Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden">
                        {filteredProjects.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <FileText className="mx-auto w-12 h-12 mb-4 text-gray-300 dark:text-gray-700" />
                                <p>No projects found matching your criteria</p>
                            </div>
                        ) : (
                            <DragScroll>
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Project Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Organization</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Score</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Completion Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredProjects.map((project) => (
                                            <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">
                                                    {project.project_code}
                                                </td>
                                                <td className="px-6 py-4 text-sm max-w-xs truncate text-gray-900 dark:text-white">
                                                    {project.title}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {project.organization}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {getScoreBadge(project.average_score)}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {project.is_certified ? (
                                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                                            Certified
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {project.completion_date}
                                                </td>
                                                <td className="px-6 py-4 text-left">
                                                    <div className="flex justify-left gap-2">
                                                        <a
                                                            href={route('admin2.certifications.show', project.id)}
                                                            className={combineTheme('inline-flex items-center justify-center p-1.5 rounded-md text-sm font-medium transition-all', themeClasses.button.secondary)}
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </a>
                                                     <div className="flex justify-center gap-2">
                                                        {project.is_certified && project.certificate_id && (
                                                            <a
                                                                href={route('admin2.certifications.download', project.certificate_id)}
                                                                className={combineTheme('inline-flex items-center justify-center p-1.5 rounded-md text-sm font-medium transition-all', themeClasses.button.secondary)}
                                                                title="Download Certificate"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Download className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                     </div>
                                                        
                                                        
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </DragScroll>
                        )}
                        {/* Pagination */}
                        {pagination.total > 0 && (
                            <div className="px-6 py-4 border-t flex items-center justify-between bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                            <div className={combineTheme('text-sm', themeClasses.text.secondary)}>
                                Page <span className={combineTheme('font-semibold', themeClasses.text.primary)}>{pagination.current_page}</span> of <span className={combineTheme('font-semibold', themeClasses.text.primary)}>{pagination.last_page}</span>
                                <span className={combineTheme('ml-2', themeClasses.text.tertiary)}>({pagination.total} total)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {pagination.links.filter((l) => l.label !== '&laquo; Previous' && l.label !== 'Next &raquo;').map((l, i) => (
                                    <button
                                        key={i}
                                        disabled={!l.url}
                                        onClick={() => l.url && (window.location.href = l.url)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            l.active
                                                ? combineTheme('text-white shadow-md', 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800')
                                                : combineTheme('border', themeClasses.button.secondary)
                                        } ${!l.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
