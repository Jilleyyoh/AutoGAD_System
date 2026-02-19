import React, { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { FileText, Download, Eye, AlertCircle, Award } from 'lucide-react';

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

                    {/* Info Card */}
                    <div className="mb-8 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-purple-900 dark:text-purple-100">About Certifications</h3>
                                <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                                    Issue certificates for projects that have completed their evaluation process and meet certification criteria.
                                </p>
                            </div>
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
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full px-4 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="all">All Projects</option>
                                    <option value="pending">Pending Certification</option>
                                    <option value="certified">Certified</option>
                                </select>
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
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Project Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Organization</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Score</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Completion Date</th>
                                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
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
                                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                                            <Award className="w-4 h-4" />
                                                            Certified
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {project.completion_date}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <a
                                                            href={route('admin2.certifications.show', project.id)}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </a>
                                                        {project.is_certified && project.certificate_id && (
                                                            <a
                                                                href={route('admin2.certifications.download', project.certificate_id)}
                                                                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                                                title="Download Certificate"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Download className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.total > 0 && (
                        <div className="mt-4 flex justify-center items-center gap-4">
                            {pagination.current_page > 1 && (
                                <Link
                                    href={route('admin2.certifications.index', { page: pagination.current_page - 1 })}
                                >
                                    &lt;
                                </Link>
                            )}
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {filteredProjects.length} of {pagination.total} projects
                                {pagination.last_page > 1 && ` (Page ${pagination.current_page} of ${pagination.last_page})`}
                            </div>
                            {pagination.current_page < pagination.last_page && (
                                <Link
                                    href={route('admin2.certifications.index', { page: pagination.current_page + 1 })}
                                >
                                    &gt;
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
