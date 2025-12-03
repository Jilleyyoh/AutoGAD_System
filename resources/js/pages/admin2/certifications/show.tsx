import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { themeClasses, combineTheme } from '@/lib/theme-classes';
import VersionInfo from '@/components/version-info';
import { 
    Award, 
    FileText, 
    Download, 
    ChevronLeft, 
    AlertCircle, 
    CheckCircle,
    Loader
} from 'lucide-react';
import axios from 'axios';

interface ProjectData {
    id: number;
    project_code: string;
    title: string;
    description: string;
    organization: string;
    proponent_name: string;
    proponent_email: string;
    domain: string;
    phase: string;
    status: string;
    submission_date: string;
}

interface ScoreCategory {
    category_id: number;
    category_name: string;
    subtotal: number;
    items: Array<{
        question: string;
        score: number;
        remarks: string;
    }>;
}

interface QuestionnaireVersion {
    id: number;
    version_number: string;
    status: 'active' | 'archived' | 'draft';
    is_active: boolean;
    created_at: string;
    description?: string;
}

interface Document {
    id: number;
    file_name: string;
    description: string;
    document_type: string;
    upload_date: string;
    file_path: string;
    drive_link: string;
}

interface CertificateData {
    id: number;
    certificate_number: string;
    issued_date: string;
    issued_by: string;
}

interface Interpretation {
    interpretation: string;
    description: string;
}

interface ScoreInterpretation {
    min: number;
    max: number;
    interpretation: string;
    description?: string;
}

interface Evaluation {
    id: number;
    evaluator_name: string;
    evaluator_email: string;
    total_score: number | null;
    interpretation: string;
    final_remarks: string;
    completion_date: string;
    scores_by_category: ScoreCategory[];
    questionnaire_version?: QuestionnaireVersion;
}

interface Props {
    project: ProjectData;
    evaluations: Evaluation[];
    average_score: number | null;
    evaluation_count: number;
    interpretation: Interpretation | null;
    interpretations: ScoreInterpretation[];
    documents: Document[];
    certificate: CertificateData | null;
}

export default function CertificationShow({
    project,
    evaluations,
    average_score,
    evaluation_count,
    interpretation,
    interpretations,
    documents,
    certificate
}: Props) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [showGenerateForm, setShowGenerateForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleGenerateCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsGenerating(true);

        try {
            const response = await axios.post(
                route('admin2.certifications.generate', project.id),
                { confirmation_remarks: remarks }
            );

            setSuccess(true);
            setRemarks('');
            setShowGenerateForm(false);

            // Reload page after 2 seconds to show the generated certificate
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to generate certificate');
        } finally {
            setIsGenerating(false);
        }
    };

    // Get interpretation from Admin 1 questionnaire settings based on score
    const getInterpretation = (score?: number): string => {
        if (!score) return 'Pending';
        
        const interpretation = interpretations.find(
            (interp) => score >= interp.min && score <= interp.max
        );
        
        return interpretation?.interpretation || 'Unknown';
    };

    // Get color scheme based on score interpretation ranges
    const getScoreColorScheme = (score?: number | null) => {
        if (score === undefined || score === null) {
            return {
                bg: 'from-gray-50 to-gray-100',
                border: 'border-gray-200',
                textLabel: 'text-gray-600',
                textValue: 'text-gray-900',
                textSecondary: 'text-gray-700',
                textTertiary: 'text-gray-600',
                icon: 'text-gray-600',
            };
        }

        if (score >= 15) {
            return {
                bg: 'from-green-50 to-green-100',
                border: 'border-green-200',
                textLabel: 'text-green-600',
                textValue: 'text-green-900',
                textSecondary: 'text-green-700',
                textTertiary: 'text-green-600',
                icon: 'text-green-600',
            };
        } else if (score >= 8) {
            return {
                bg: 'from-blue-50 to-blue-100',
                border: 'border-blue-200',
                textLabel: 'text-blue-600',
                textValue: 'text-blue-900',
                textSecondary: 'text-blue-700',
                textTertiary: 'text-blue-600',
                icon: 'text-blue-600',
            };
        } else if (score >= 4) {
            return {
                bg: 'from-yellow-50 to-yellow-100',
                border: 'border-yellow-200',
                textLabel: 'text-yellow-600',
                textValue: 'text-yellow-900',
                textSecondary: 'text-yellow-700',
                textTertiary: 'text-yellow-600',
                icon: 'text-yellow-600',
            };
        } else {
            return {
                bg: 'from-red-50 to-red-100',
                border: 'border-red-200',
                textLabel: 'text-red-600',
                textValue: 'text-red-900',
                textSecondary: 'text-red-700',
                textTertiary: 'text-red-600',
                icon: 'text-red-600',
            };
        }
    };

    const isCertified = certificate !== null;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin2.dashboard') },
                { title: 'Certifications', href: route('admin2.certifications.index') },
                { title: `${project.project_code} Details`, href: route('admin2.certifications.show', project.id) },
            ]}
            sidebarOpen={false}
        >
            <Head title={`Certification - ${project.project_code}`} />

            <div className="min-h-screen bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Header with Back Button */}
                    <div className="mb-8">
        
                        <h1 className={combineTheme('text-3xl font-bold flex items-center gap-3', themeClasses.text.primary)}>
                            Certification Details
                        </h1>
                    </div>

                    {/* Status Banner */}
                    {isCertified && (
                        <div className={combineTheme('mb-6 p-4 border rounded-lg flex items-start gap-3', themeClasses.alert.success)}>
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-green-900 dark:text-green-100">Project Certified</h3>
                                <p className="text-green-700 dark:text-green-200 text-sm">
                                    Certificate #{certificate.certificate_number} issued on {certificate.issued_date} by {certificate.issued_by}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className={combineTheme('mb-6 p-4 border rounded-lg', themeClasses.alert.success)}>
                            <p className="text-green-700 dark:text-green-200 font-medium">✓ Certificate generated successfully!</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className={combineTheme('mb-6 p-4 border rounded-lg flex items-start gap-3', themeClasses.alert.error)}>
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">Error</h3>
                                <p className="text-red-700 dark:text-red-200 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Project Information */}
                            <div className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
                                <h2 className={combineTheme('text-lg font-semibold mb-4 flex items-center gap-2', themeClasses.text.primary)}>
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Project Information
                                </h2>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={combineTheme('text-sm', themeClasses.text.tertiary)}>Project Code</p>
                                            <p className={combineTheme('text-base font-medium', themeClasses.text.primary)}>
                                                {project.project_code}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={combineTheme('text-sm', themeClasses.text.tertiary)}>Status</p>
                                            <p className={combineTheme('text-base font-medium', themeClasses.text.primary)}>{project.status}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className={combineTheme('text-sm', themeClasses.text.tertiary)}>Title</p>
                                        <p className={combineTheme('text-base font-medium', themeClasses.text.primary)}>{project.title}</p>
                                    </div>
                                    <div>
                                        <p className={combineTheme('text-sm', themeClasses.text.tertiary)}>Description</p>
                                        <p className={combineTheme('text-sm', themeClasses.text.secondary)}>{project.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={combineTheme('text-sm', themeClasses.text.tertiary)}>Organization</p>
                                            <p className={combineTheme('text-base font-medium', themeClasses.text.primary)}>{project.organization}</p>
                                        </div>
                                        <div>
                                            <p className={combineTheme('text-sm', themeClasses.text.tertiary)}>Domain</p>
                                            <p className={combineTheme('text-base font-medium', themeClasses.text.primary)}>{project.domain}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className={combineTheme('text-sm', themeClasses.text.tertiary)}>Implementation Phase</p>
                                            <p className={combineTheme('text-base font-medium', themeClasses.text.primary)}>{project.phase}</p>
                                        </div>
                                        <div>
                                            <p className={combineTheme('text-sm', themeClasses.text.tertiary)}>Submission Date</p>
                                            <p className={combineTheme('text-base font-medium', themeClasses.text.primary)}>{project.submission_date}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Consolidated Score */}
                            <div className={`bg-gradient-to-r ${getScoreColorScheme(average_score).bg} border ${getScoreColorScheme(average_score).border} rounded-lg p-8 mb-8`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className={`text-sm font-medium ${getScoreColorScheme(average_score).textLabel} uppercase tracking-wide`}>Consolidated Average Score</p>
                                        <p className={`text-5xl font-bold ${getScoreColorScheme(average_score).textValue} mt-2`}>
                                            {average_score?.toFixed(2) || 'N/A'}
                                        </p>
                                        <p className={`text-lg ${getScoreColorScheme(average_score).textSecondary} mt-2 font-semibold`}>
                                            {getInterpretation(average_score || undefined)}
                                        </p>
                                        <p className={`text-sm ${getScoreColorScheme(average_score).textTertiary} mt-1`}>
                                            Based on {evaluation_count} completed evaluation(s)
                                        </p>
                                    </div>
                                    <CheckCircle className={`w-16 h-16 ${getScoreColorScheme(average_score).icon}`} />
                                </div>
                            </div>

                            {/* Individual Evaluations */}
                            <div className="space-y-6 mb-8">
                                {evaluations.map((evaluation) => (
                                    <div key={evaluation.id} className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
                                        {/* Evaluator Header */}
                                        <div className="flex items-start justify-between mb-6 pb-6 border-b">
                                            <div>
                                                <h3 className={combineTheme('text-lg font-semibold', themeClasses.text.primary)}>{evaluation.evaluator_name}</h3>
                                                <p className={combineTheme('text-sm', themeClasses.text.secondary)}>{evaluation.evaluator_email}</p>
                                                <p className={combineTheme('text-xs mt-1', themeClasses.text.tertiary)}>Submitted: {evaluation.completion_date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-3xl font-bold ${getScoreColorScheme(evaluation.total_score).textValue}`}>{evaluation.total_score?.toFixed(2)}</p>
                                                <p className={`text-sm ${getScoreColorScheme(evaluation.total_score).textTertiary} mt-1`}>{evaluation.interpretation}</p>
                                            </div>
                                        </div>

                                        {/* Version Info */}
                                        {evaluation.questionnaire_version && (
                                            <div className="mb-6 pb-6 border-b w-full max-w-none overflow-hidden">
                                                <div className="w-full max-w-none flex">
                                                    <div className="flex-1">
                                                        <VersionInfo 
                                                            version={evaluation.questionnaire_version}
                                                            compact={true}
                                                            fullWidth={true}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Scores by Category */}
                                        <div className="space-y-4 mb-4">
                                            {evaluation.scores_by_category.map((category, catIdx) => (
                                                <div key={catIdx} className="bg-gray-50 dark:bg-gray-900 rounded p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className={combineTheme('font-semibold', themeClasses.text.primary)}>{category.category_name}</h4>
                                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                            {category.subtotal.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {category.items.map((item, itemIdx) => (
                                                            <div key={itemIdx} className="flex justify-between text-sm">
                                                                <span className={combineTheme('', themeClasses.text.secondary)}>{item.question}</span>
                                                                <span className={combineTheme('font-medium ml-10', themeClasses.text.primary)}>{item.score}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {category.items.some(i => i.remarks) && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                            <p className={combineTheme('text-xs font-medium mb-1', themeClasses.text.tertiary)}>Remarks:</p>
                                                            <p className={combineTheme('text-sm italic', themeClasses.text.secondary)}>
                                                                {category.items
                                                                    .filter(i => i.remarks)
                                                                    .map(i => i.remarks)
                                                                    .join(' | ')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Final Remarks */}
                                        {evaluation.final_remarks && (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded p-4">
                                                <p className={combineTheme('text-sm font-medium mb-1', themeClasses.text.primary)}>Final Remarks</p>
                                                <p className={combineTheme('text-sm', themeClasses.text.secondary)}>{evaluation.final_remarks}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Score Interpretations Reference */}
                            <div className={combineTheme('rounded-lg shadow p-6 mb-8', themeClasses.card.base)}>
                                <h3 className={combineTheme('text-lg font-semibold mb-4', themeClasses.text.primary)}>Score Interpretation Reference</h3>
                                <div className="space-y-2">
                                    {interpretations.map((interp, idx) => (
                                        <div key={idx} className={combineTheme('flex items-center justify-between p-3 rounded-lg', themeClasses.table.row)}>
                                            <div>
                                                <p className={combineTheme('font-medium', themeClasses.text.primary)}>{interp.interpretation}</p>
                                                {interp.description && (
                                                    <p className={combineTheme('text-sm', themeClasses.text.secondary)}>{interp.description}</p>
                                                )}
                                            </div>
                                            <span className={combineTheme('text-sm font-bold px-3 py-1 rounded whitespace-nowrap flex-shrink-0', themeClasses.text.primary, themeClasses.badge.blue)}>
                                                {interp.min.toFixed(0)} - {interp.max.toFixed(0)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Documents */}
                            {documents.length > 0 && (
                                <div className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
                                    <h2 className={combineTheme('text-lg font-semibold mb-4 flex items-center gap-2', themeClasses.text.primary)}>
                                        <FileText className="w-5 h-5 text-green-600" />
                                        Project Documents ({documents.length})
                                    </h2>
                                    <div className="space-y-2">
                                        {documents.map((doc) => (
                                            <div key={doc.id} className={combineTheme('flex items-center justify-between p-3 border rounded-lg transition-colors', themeClasses.table.row, themeClasses.border.primary)}>
                                                <div className="flex-1">
                                                    <p className={combineTheme('font-medium', themeClasses.text.primary)}>{doc.file_name}</p>
                                                    <p className={combineTheme('text-xs', themeClasses.text.tertiary)}>
                                                        {doc.document_type} • Uploaded: {doc.upload_date}
                                                    </p>
                                                    {doc.description && (
                                                        <p className={combineTheme('text-sm mt-1', themeClasses.text.secondary)}>{doc.description}</p>
                                                    )}
                                                    {doc.drive_link && (
                                                        <p className={combineTheme('text-sm mt-1 text-blue-600 dark:text-blue-400', themeClasses.text.secondary)}>Link: {doc.drive_link}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Certificate Generation */}
                        <div className="lg:col-span-1">
                            <div className={combineTheme('rounded-lg shadow p-6 sticky top-8', themeClasses.card.base)}>
                                <h2 className={combineTheme('text-lg font-semibold mb-4 flex items-center gap-2', themeClasses.text.primary)}>
                                    <Award className="w-5 h-5 text-blue-600" />
                                    Certification
                                </h2>

                                {isCertified ? (
                                    <div>
                                        <div className={combineTheme('mb-6 p-4 border rounded-lg', themeClasses.alert.success)}>
                                            <p className={combineTheme('text-sm font-medium mb-1', themeClasses.text.primary)}>Status</p>
                                            <p className="text-lg font-bold text-green-600 dark:text-green-400">Certified</p>
                                            <p className="text-xs text-green-700 dark:text-green-200 mt-2">
                                                Certificate #{certificate.certificate_number}
                                            </p>
                                        </div>

                                        <a
                                            href={route('admin2.certifications.download', certificate.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={combineTheme('w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-3', themeClasses.button.primary)}
                                        >
                                            <Download className="w-5 h-5" />
                                            Download Certificate PDF
                                        </a>

                                        <p className={combineTheme('text-xs text-center', themeClasses.text.tertiary)}>
                                            Issued on {certificate.issued_date}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className={combineTheme('mb-4 p-4 border rounded-lg', themeClasses.alert.info)}>
                                            <p className={combineTheme('text-sm font-medium mb-1', themeClasses.text.primary)}>Status</p>
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">Pending</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-200 mt-2">
                                                Ready to issue certificate
                                            </p>
                                        </div>

                                        {!showGenerateForm ? (
                                            <button
                                                onClick={() => setShowGenerateForm(true)}
                                                className={combineTheme('w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors', themeClasses.button.primary)}
                                            >
                                                <Award className="w-5 h-5" />
                                                Generate Certificate
                                            </button>
                                        ) : (
                                            <form onSubmit={handleGenerateCertificate} className="space-y-3">
                                                <div>
                                                    <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
                                                        Additional Remarks (Optional)
                                                    </label>
                                                    <textarea
                                                        value={remarks}
                                                        onChange={(e) => setRemarks(e.target.value)}
                                                        placeholder="Add any remarks about this certification..."
                                                        rows={3}
                                                        className={combineTheme('w-full px-3 py-2 rounded-lg text-sm', themeClasses.input.base, themeClasses.input.focus, themeClasses.input.placeholder)}
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={isGenerating}
                                                    className={combineTheme('w-full font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed', isGenerating ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white')}
                                                >
                                                    {isGenerating ? (
                                                        <>
                                                            <Loader className="w-4 h-4 animate-spin" />
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" />
                                                            Confirm & Generate
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowGenerateForm(false)}
                                                    disabled={isGenerating}
                                                    className={combineTheme('w-full font-semibold py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed', themeClasses.button.secondary)}
                                                >
                                                    Cancel
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Proponent Info Card */}
                            <div className={combineTheme('rounded-lg shadow p-6 mt-6', themeClasses.card.base)}>
                                <h3 className={combineTheme('text-sm font-semibold mb-3', themeClasses.text.primary)}>Proponent Information</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className={combineTheme('text-xs', themeClasses.text.tertiary)}>Name</p>
                                        <p className={combineTheme('text-sm font-medium', themeClasses.text.primary)}>{project.proponent_name}</p>
                                    </div>
                                    <div>
                                        <p className={combineTheme('text-xs', themeClasses.text.tertiary)}>Email</p>
                                        <p className={combineTheme('text-sm break-all', themeClasses.link.primary)}>{project.proponent_email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
