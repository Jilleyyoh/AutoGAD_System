import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ChevronLeft, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import VersionInfo from '@/components/version-info';
import { themeClasses, combineTheme } from '@/lib/theme-classes';
import axios from 'axios';
import { route } from 'ziggy-js';

interface QuestionnaireVersion {
    id: number;
    version_number: string;
    status: 'active' | 'archived' | 'draft';
    is_active: boolean;
    created_at: string;
    description?: string;
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

interface EvaluationResult {
    id: number;
    evaluator_name: string;
    evaluator_email: string;
    total_score?: number;
    interpretation: string;
    final_remarks: string;
    completion_date: string;
    scores_by_category: ScoreCategory[];
    questionnaire_version?: QuestionnaireVersion;
}

interface Project {
    id: number;
    project_code: string;
    title: string;
    description: string;
    organization: string;
    proponent_name: string;
    domain: string;
    phase: string;
    status: string;
}

interface ScoreInterpretation {
    min: number;
    max: number;
    interpretation: string;
    description?: string;
}

interface Props {
    project: Project;
    evaluations: EvaluationResult[];
    average_score?: number;
    evaluation_count: number;
    interpretations: ScoreInterpretation[];
}

export default function Review({ project, evaluations, average_score, evaluation_count, interpretations }: Props) {
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [adminRemarks, setAdminRemarks] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this evaluation for certification?')) {
            return;
        }

        setApproving(true);
        try {
            await axios.post(`/admin2/evaluations/${project.id}/consolidate`, {
                action: 'approve',
                admin_remarks: adminRemarks,
            });

            setMessage({ type: 'success', text: 'Evaluation approved for certification!' });
            setTimeout(() => {
                window.location.href = '/admin2/evaluations';
            }, 2000);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to approve evaluation',
            });
        } finally {
            setApproving(false);
        }
    };

    const handleReturnForReview = async () => {
        if (!confirm('Are you sure you want to return this evaluation for review?')) {
            return;
        }

        setRejecting(true);
        try {
            await axios.post(`/admin2/evaluations/${project.id}/consolidate`, {
                action: 'return_for_review',
                admin_remarks: adminRemarks,
            });

            setMessage({ type: 'success', text: 'Evaluation returned for review!' });
            setTimeout(() => {
                window.location.href = '/admin2/evaluations';
            }, 2000);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to return evaluation',
            });
        } finally {
            setRejecting(false);
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

    // Get color scheme based on score interpretation ranges: 0-4 (red), 4-8 (orange), 8-15 (blue), 15-20+ (green)
    const getScoreColorScheme = (score?: number) => {
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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin2.dashboard') },
                { title: 'Evaluations', href: route('admin2.evaluations.index') },
                { title: `Review ${project.project_code}`, href: `/admin2/evaluations/${project.id}/review` },
            ]}
            sidebarOpen={false}
        >
            <Head title={`Review Evaluation - ${project.project_code}`} />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Link
                                href="/admin2/evaluations"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{project.project_code}</h1>
                                <p className="text-gray-600">{project.title}</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {message && (
                        <div
                            className={`mb-6 p-4 rounded-lg ${
                                message.type === 'success'
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Project Info */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Organization</p>
                                <p className="mt-1 text-gray-900">{project.organization}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Proponent</p>
                                <p className="mt-1 text-gray-900">{project.proponent_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Domain</p>
                                <p className="mt-1 text-gray-900">{project.domain}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Phase</p>
                                <p className="mt-1 text-gray-900">{project.phase}</p>
                            </div>
                        </div>
                        {project.description && (
                            <div className="mt-6">
                                <p className="text-sm font-medium text-gray-500">Description</p>
                                <p className="mt-2 text-gray-700">{project.description}</p>
                            </div>
                        )}
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
                                    {getInterpretation(average_score)}
                                </p>
                                <p className={`text-sm ${getScoreColorScheme(average_score).textTertiary} mt-1`}>
                                    Based on {evaluation_count} completed evaluation(s)
                                </p>
                            </div>
                            <CheckCircle2 className={`w-16 h-16 ${getScoreColorScheme(average_score).icon}`} />
                        </div>
                    </div>

                    {/* Individual Evaluations */}
                    <div className="space-y-6 mb-8">
                        {evaluations.map((evaluation, idx) => (
                            <div key={evaluation.id} className="bg-white rounded-lg shadow p-6">
                                {/* Evaluator Header */}
                                <div className="flex items-start justify-between mb-6 pb-6 border-b">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{evaluation.evaluator_name}</h3>
                                        <p className="text-sm text-gray-600">{evaluation.evaluator_email}</p>
                                        <p className="text-xs text-gray-500 mt-1">Submitted: {evaluation.completion_date}</p>
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
                                        <div key={catIdx} className="bg-gray-50 rounded p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900">{category.category_name}</h4>
                                                <span className="text-sm font-bold text-blue-600">
                                                    {category.subtotal.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {category.items.map((item, itemIdx) => (
                                                    <div key={itemIdx} className="flex justify-between text-sm">
                                                        <span className="text-gray-700">{item.question}</span>
                                                        <span className="font-medium text-gray-900 ml-10">{item.score}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {category.items.some(i => i.remarks) && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs font-medium text-gray-600 mb-1">Remarks:</p>
                                                    <p className="text-sm text-gray-700 italic">
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
                                    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                                        <p className="text-sm font-medium text-yellow-900 mb-1">Final Remarks</p>
                                        <p className="text-sm text-yellow-800">{evaluation.final_remarks}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Admin Remarks & Actions */}
                    {project.status === 'approved' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Decision</h3>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Remarks (Optional)
                                </label>
                                <textarea
                                    value={adminRemarks}
                                    onChange={(e) => setAdminRemarks(e.target.value)}
                                    placeholder="Add any remarks or notes for the consolidation..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleApprove}
                                    disabled={approving || rejecting}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    {approving ? 'Approving...' : 'Approve for Certification'}
                                </button>
                                <button
                                    onClick={handleReturnForReview}
                                    disabled={approving || rejecting}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    {rejecting ? 'Processing...' : 'Return for Review'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
