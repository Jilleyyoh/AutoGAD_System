import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, FileText, Download, ExternalLink, Loader, ClipboardList, Eye } from 'lucide-react';
import { themeClasses, combineTheme } from '@/lib/theme-classes';

interface ProjectDetails {
    id: number;
    project_code: string;
    project_title: string;
    project_description?: string;
    rationale?: string;
    objectives?: string;
    proponent: {
        id: number;
        organization: string;
        name: string;
    };
    domain_expertise: {
        id: number;
        name: string;
    };
    implementation_phase: {
        id: number;
        name: string;
    };
    project_status: {
        id: number;
        name: string;
    };
    current_evaluator?: {
        id: number;
        name: string;
        email: string;
    } | null;
    submission_date: string;
    total_score?: number;
    remarks?: string;
    for_revision_remarks?: string;
    revision_count?: number;
    evaluation?: {
        status_id: number;
        final_remarks?: string;
        interpretation?: {
            interpretation: string;
            description: string;
        };
        completion_date?: string;
        is_completed?: boolean;
    } | null;
    interpretations?: Array<{
        min: number;
        max: number;
        interpretation: string;
        description: string;
    }>;
    documents: Array<{
        id: number;
        file_name: string;
        description?: string;
        document_type: string;
        upload_date: string;
        file_path?: string;
        drive_link?: string;
    }>;
}

interface ViewProjectDetailsModalProps {
    isOpen: boolean;
    projectId: number | null;
    onClose: () => void;
}

interface TabOption {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
}

const TABS: TabOption[] = [
    { id: 'info', label: 'Project Info', icon: ClipboardList },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'result', label: 'Evaluation Result', icon: Eye },
];

export default function ViewProjectDetailsModal({
    isOpen,
    projectId,
    onClose,
}: ViewProjectDetailsModalProps) {
    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (isOpen && projectId) {
            setActiveTab('info');
            fetchProjectDetails();
        }
    }, [isOpen, projectId]);

    const fetchProjectDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/admin1/assignments/project/${projectId}`);
            setProject(response.data);
        } catch (err: any) {
            console.error('Error fetching project details:', err);
            setError(err.response?.data?.message || 'Failed to load project details');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/40 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className={combineTheme('rounded-lg shadow-2xl border', themeClasses.card.base, 'border-gray-200 dark:border-slate-700')}>
                    {/* Header */}
                    <div className={combineTheme('sticky top-0 p-6 flex items-center justify-between border-b', 'bg-gradient-to-r from-blue-600 to-blue-700 text-white', themeClasses.table.border)}>
                        <div>
                            <h2 className="text-2xl font-bold">Project Details</h2>
                            <p className="text-blue-100 text-sm mt-1">View complete project information</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : error ? (
                        <div className="p-6">
                            <div className={combineTheme('border px-4 py-3 rounded', themeClasses.alert.error)}>
                                {error}
                            </div>
                        </div>
                    ) : project ? (
                        <div className="p-6">
                            {/* Tabs */}
                            <div className={combineTheme('mb-6 border-b', themeClasses.border.primary)}>
                                <div className="flex space-x-8">
                                    {TABS.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                    : combineTheme('border-transparent', themeClasses.text.tertiary, 'hover:text-gray-700 dark:hover:text-gray-300')
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Project Info Tab */}
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Project Code</p>
                                            <p className={combineTheme('mt-1 font-mono', themeClasses.text.primary)}>{project.project_code}</p>
                                        </div>
                                        <div>
                                            <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Status</p>
                                            <span className={combineTheme('inline-flex items-center px-3 py-1 mt-1 rounded-full text-sm font-medium', themeClasses.badge.blue)}>
                                                {project.project_status.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Title</p>
                                        <p className={combineTheme('mt-1 font-semibold', themeClasses.text.primary)}>{project.project_title}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Organization</p>
                                            <p className={combineTheme('mt-1', themeClasses.text.primary)}>{project.proponent.organization}</p>
                                        </div>
                                        <div>
                                            <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Proponent</p>
                                            <p className={combineTheme('mt-1', themeClasses.text.primary)}>{project.proponent.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Domain</p>
                                            <p className={combineTheme('mt-1', themeClasses.text.primary)}>{project.domain_expertise.name}</p>
                                        </div>
                                        <div>
                                            <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Phase</p>
                                            <p className={combineTheme('mt-1', themeClasses.text.primary)}>{project.implementation_phase.name}</p>
                                        </div>
                                    </div>

                                    {project.rationale && (
                                        <div>
                                            <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Rationale</p>
                                            <p className={combineTheme('mt-1 whitespace-pre-wrap', themeClasses.text.secondary)}>{project.rationale}</p>
                                        </div>
                                    )}

                                    {project.objectives && (
                                        <div>
                                            <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Objectives</p>
                                            <p className={combineTheme('mt-1 whitespace-pre-wrap', themeClasses.text.secondary)}>{project.objectives}</p>
                                        </div>
                                    )}

                                    {project.project_description && (
                                        <div>
                                            <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Description</p>
                                            <p className={combineTheme('mt-1 whitespace-pre-wrap', themeClasses.text.secondary)}>{project.project_description}</p>
                                        </div>
                                    )}

                                    {project.current_evaluator && (
                                        <div className={combineTheme('border rounded-lg p-4 mt-4', themeClasses.badge.green)}>
                                            <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Assigned Evaluator</p>
                                            <p className={combineTheme('mt-1 font-semibold', themeClasses.text.primary)}>{project.current_evaluator.name}</p>
                                            <p className={combineTheme('text-sm', themeClasses.text.secondary)}>{project.current_evaluator.email}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Documents Tab */}
                            {activeTab === 'documents' && (
                                <div className="space-y-4">
                                    {project.documents.length > 0 ? (
                                        <div className="space-y-3">
                                            {project.documents.map(doc => (
                                                <div key={doc.id} className={combineTheme('flex items-start gap-3 p-4 border rounded-lg', themeClasses.table.row, 'hover:bg-gray-50 dark:hover:bg-slate-700')}>
                                                    <FileText className={combineTheme('w-5 h-5 flex-shrink-0 mt-1', themeClasses.icon.primary)} />
                                                    <div className="flex-grow min-w-0">
                                                        <p className={combineTheme('font-semibold truncate', themeClasses.text.primary)}>{doc.file_name}</p>
                                                        <p className={combineTheme('text-sm', themeClasses.text.tertiary)}>{doc.document_type}</p>
                                                        {doc.description && <p className={combineTheme('text-sm mt-1', themeClasses.text.tertiary)}>{doc.description}</p>}
                                                        {doc.drive_link && <p className={combineTheme('text-sm mt-1 text-blue-600 dark:text-blue-400', themeClasses.text.tertiary)}>Link: {doc.drive_link}</p>}
                                                        <p className={combineTheme('text-xs mt-1', themeClasses.text.muted)}>Uploaded: {new Date(doc.upload_date).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-2 flex-shrink-0">
                                                        {doc.file_path && (
                                                            <a href={`/admin1/assignments/download/${doc.id}`} className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors">
                                                                <Download className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={combineTheme('text-center py-8', themeClasses.text.tertiary)}>No documents uploaded</p>
                                    )}
                                </div>
                            )}

                            {/* Evaluation Result Tab */}
                            {activeTab === 'result' && (
                                <div className="space-y-6">
                                    {project.project_status.name === 'for_evaluation' && !project.evaluation ? (
                                        <div className={combineTheme('border rounded-lg p-6 text-center', 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800')}>
                                            <p className={combineTheme('font-semibold', 'text-amber-900 dark:text-amber-100')}>
                                                {project.revision_count && project.revision_count > 0
                                                    ? 'Evaluator is about to re-evaluate. No evaluations yet.'
                                                    : 'No evaluations yet.'}
                                            </p>
                                        </div>
                                    ) : project.evaluation ? (
                                        <>
                                            <div className={combineTheme('border rounded-lg p-6', themeClasses.border.primary, 'bg-blue-50 dark:bg-blue-900/30')}>
                                                <p className={combineTheme('text-sm font-medium mb-2', themeClasses.text.tertiary)}>Total Score</p>
                                                <div className="flex items-baseline gap-4">
                                                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{project.total_score !== null && project.total_score !== undefined ? parseFloat(String(project.total_score)).toFixed(2) : 'N/A'}</p>
                                                    {project.evaluation.interpretation && (
                                                        <div>
                                                            <p className={combineTheme('font-semibold text-lg', themeClasses.text.primary)}>{project.evaluation.interpretation.interpretation}</p>
                                                            <p className={combineTheme('text-sm mt-1', themeClasses.text.secondary)}>{project.evaluation.interpretation.description}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {project.interpretations && project.interpretations.length > 0 && (
                                                <div className={combineTheme('border rounded-lg p-6', themeClasses.border.primary)}>
                                                    <p className={combineTheme('text-sm font-medium mb-4', themeClasses.text.tertiary)}>Scoring Reference</p>
                                                    <div className="space-y-3">
                                                        {project.interpretations.map((interp, idx) => (
                                                            <div key={idx} className={combineTheme('flex justify-between p-3 rounded', 'bg-gray-50 dark:bg-slate-700/50')}>
                                                                <div>
                                                                    <p className={combineTheme('font-medium', themeClasses.text.primary)}>{interp.interpretation}</p>
                                                                    <p className={combineTheme('text-sm', themeClasses.text.secondary)}>{interp.description}</p>
                                                                </div>
                                                                <p className={combineTheme('font-mono text-sm font-semibold', themeClasses.text.tertiary)}>{interp.min} - {interp.max}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className={combineTheme('border rounded-lg p-6', themeClasses.border.primary)}>
                                                <p className={combineTheme('text-sm font-medium mb-3', themeClasses.text.tertiary)}>Final Remarks</p>
                                                <div className={combineTheme('p-4 rounded-lg', 'bg-gray-50 dark:bg-slate-700/50')}>
                                                    {project.evaluation.final_remarks ? (
                                                        <p className={combineTheme('whitespace-pre-wrap', themeClasses.text.primary)}>{project.evaluation.final_remarks}</p>
                                                    ) : (
                                                        <p className={combineTheme('italic', themeClasses.text.tertiary)}>No remarks provided</p>
                                                    )}
                                                </div>
                                            </div>

                                            {project.evaluation.is_completed && (
                                                <div className={combineTheme('border rounded-lg p-6', 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800')}>
                                                    <p className={combineTheme('font-semibold', 'text-green-900 dark:text-green-100')}>✓ Evaluation Submitted</p>
                                                    {project.evaluation.completion_date && (
                                                        <p className={combineTheme('text-sm mt-2', 'text-green-800 dark:text-green-100')}>Submitted: {new Date(project.evaluation.completion_date).toLocaleString()}</p>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className={combineTheme('border rounded-lg p-6 text-center', 'bg-gray-50 dark:bg-slate-700/50')}>
                                            <p className={themeClasses.text.tertiary}>No evaluation data available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
