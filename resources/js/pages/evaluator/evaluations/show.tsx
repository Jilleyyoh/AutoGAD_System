import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ChevronLeft, Save, Send, CheckCircle2, Award, FileText, Clock } from 'lucide-react';
import axios from 'axios';
import { themeClasses, combineTheme } from '@/lib/theme-classes';

interface ProjectData {
    id: number;
    project_code: string;
    title: string;
    description?: string;
    rationale?: string;
    objectives?: string;
    organization: string;
    proponent_name: string;
    domain: string;
    phase: string;
    submission_date: string;
    status: string;
    admin2_remarks?: string;
    certificate?: {
        id: number;
        certificate_number: string;
        issued_date?: string;
        can_download?: boolean;
        download_route?: string;
    } | null;
}

interface Document {
    id: number;
    file_name: string;
    description?: string;
    document_type: string;
    upload_date: string;
    file_path?: string;
    drive_link?: string;
}

interface QuestionnaireItem {
    id: number;
    number: string;
    question: string;
    score_options: number[];
    max_score: number;
    current_score: number | null;
    remarks: string;
}

interface QuestionnaireCategory {
    id: number;
    name: string;
    description?: string;
    max_score: number;
    items: QuestionnaireItem[];
}

interface ScoreInterpretation {
    min: number;
    max: number;
    interpretation: string;
    description: string;
}

interface QuestionnaireVersion {
    id: number;
    version_number: string;
    created_at: string;
    description?: string;
}

interface Props {
    project: ProjectData;
    evaluation: {
        id: number;
        total_score?: number;
        status_id: number;
        final_remarks?: string;
        completion_date?: string;
        is_completed: boolean;
    };
    questionnaire_version?: QuestionnaireVersion;
    categories: QuestionnaireCategory[];
    documents: Document[];
    interpretations: ScoreInterpretation[];
    version_integrity?: {
        version_id: number | null;
        version_number: string;
        created_at?: string;
        status: string;
        categories_count: number;
        questions_count: number;
        total_max_score: number;
        snapshot_integrity: boolean;
        evaluation_locked: boolean;
    };
}

/**
 * Dynamic score labeling function
 * 
 * Maps score option POSITION to human-readable labels:
 * - Position 0 (lowest) → "No"
 * - Position 1 (middle) → "Partly"
 * - Position 2 (highest) → "Yes"
 * 
 * This works regardless of the actual numeric values:
 * - (0, 10, 20)
 * - (0, 0.5, 1)
 * - (0, 1, 2)
 * - (12, 16, 20)
 * 
 * The position in the sorted array determines the label, not the numeric value.
 */
const getScoreLabel = (score: number, scoreOptions?: number[]): string => {
    // STRICT: Only show "No", "Partly", "Yes" - nothing else
    const labels = ['No', 'Partly', 'Yes'];
    if (!scoreOptions || scoreOptions.length === 0) {
        return labels[0];
    }
    // Deduplicate and sort to get unique positions
    const uniqueOptions = Array.from(new Set(scoreOptions)).sort((a, b) => a - b);
    const position = uniqueOptions.indexOf(score);
    if (position === 0) return labels[0];
    if (position === 1) return labels[1];
    if (position === 2) return labels[2];
    return labels[0];
}

export default function Show({
    project,
    evaluation,
    categories,
    documents,
    interpretations,
    questionnaire_version,
    version_integrity,
}: Props) {
    const [activeTab, setActiveTab] = useState('info');
    const [scores, setScores] = useState<{ [key: number]: number | null }>({});
    const [remarks, setRemarks] = useState<{ [key: number]: string }>({});
    const [finalRemarks, setFinalRemarks] = useState(evaluation.final_remarks || '');
    const [finalAction, setFinalAction] = useState<'approve' | 'revision' | 'decline' | null>(null);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isCompleted] = useState(evaluation.is_completed);

    // Initialize scores and remarks from current data
    React.useEffect(() => {
        const initialScores: { [key: number]: number | null } = {};
        const initialRemarks: { [key: number]: string } = {};

        categories.forEach(category => {
            category.items.forEach(item => {
                if (item.current_score !== null) {
                    initialScores[item.id] = item.current_score;
                }
                if (item.remarks) {
                    initialRemarks[item.id] = item.remarks;
                }
            });
        });

        setScores(initialScores);
        setRemarks(initialRemarks);
    }, [categories]);

    // Calculate scores per category
    const categoryScores = useMemo(() => {
        const result: { [key: number]: { total: number; max: number; exceeded: boolean } } = {};

        categories.forEach(category => {
            const categoryTotal = category.items.reduce((sum, item) => {
                return sum + (scores[item.id] ?? 0);
            }, 0);

            result[category.id] = {
                total: categoryTotal,
                max: category.max_score,
                exceeded: categoryTotal > category.max_score,
            };
        });

        return result;
    }, [scores, categories]);

    // Use stored database total_score, not recalculated value
    // This ensures consistency across all views and avoids floating-point precision issues
    const totalScore = useMemo(() => {
        // Calculate total from live categoryScores as evaluator enters scores
        const liveTotal = Object.values(categoryScores).reduce((sum, cat) => sum + cat.total, 0);
        
        // If any scores have been entered, use the live calculation
        if (Object.keys(scores).length > 0) {
            return liveTotal;
        }
        
        // Otherwise use the saved database value
        return evaluation.total_score !== null && evaluation.total_score !== undefined 
            ? parseFloat(String(evaluation.total_score)) 
            : 0;
    }, [categoryScores, scores, evaluation.total_score]);

    // Calculate total max score across all categories
    const maxTotalScore = useMemo(() => {
        return categories.reduce((total, category) => total + category.max_score, 0);
    }, [categories]);

    // Calculate total percentage
    const totalPercentage = useMemo(() => {
        return maxTotalScore > 0 ? (totalScore / maxTotalScore) * 100 : 0;
    }, [totalScore, maxTotalScore]);

    // Get score interpretation from stored total
    const scoreInterpretation = useMemo(() => {
        return interpretations.find(
            interp => totalScore >= interp.min && totalScore <= interp.max
        );
    }, [totalScore, interpretations]);

    // Utility function for tolerant score comparison (handles floating-point precision)
    // Handles both Category 2's precision issues and clean decimal scores (Categories 4, 6)
    const scoresMatch = (score1: number | null | undefined, score2: number | null | undefined): boolean => {
        if (score1 === null || score1 === undefined) return score2 === null || score2 === undefined;
        if (score2 === null || score2 === undefined) return false;
        
        // First try exact equality for clean values (0, 0.5, 1, 2, etc.)
        if (score1 === score2) return true;
        
        // Then handle floating-point precision for Category 2 type issues
        // Convert to numbers if they're strings and apply database precision rounding
        const num1 = typeof score1 === 'string' ? parseFloat(score1) : score1;
        const num2 = typeof score2 === 'string' ? parseFloat(score2) : score2;
        
        const rounded1 = Math.round(num1 * 100) / 100;
        const rounded2 = Math.round(num2 * 100) / 100;
        return Math.abs(rounded1 - rounded2) < 0.01;
    };

    // Handle score change with validation to prevent exceeding category max
    const handleScoreChange = (itemId: number, score: number | null) => {
        if (isCompleted) return;
        
        // Find the item and its category
        let itemCategory: QuestionnaireCategory | null = null;
        let item: QuestionnaireItem | null = null;
        
        for (const cat of categories) {
            const foundItem = cat.items.find(i => i.id === itemId);
            if (foundItem) {
                itemCategory = cat;
                item = foundItem;
                break;
            }
        }
        
        if (!item || !itemCategory) return;
        
        // Calculate what the new category total would be
        const currentCategoryTotal = itemCategory.items.reduce((sum, i) => {
            if (i.id === itemId) {
                return sum + (score ?? 0);
            }
            return sum + (scores[i.id] ?? 0);
        }, 0);
        
        // Prevent exceeding the category max_score
        if (currentCategoryTotal > itemCategory.max_score) {
            setMessage({
                type: 'error',
                text: `Cannot exceed maximum score of ${itemCategory.max_score} for ${itemCategory.name}. Current: ${currentCategoryTotal}`,
            });
            setTimeout(() => setMessage(null), 4000);
            return;
        }
        
        setScores(prev => ({
            ...prev,
            [itemId]: score,
        }));
    };

    // Handle remarks change
    const handleRemarksChange = (itemId: number, value: string) => {
        if (isCompleted) return;
        setRemarks(prev => ({
            ...prev,
            [itemId]: value,
        }));
    };

    // Save evaluation
    const handleSave = async () => {
        setSaving(true);
        try {
            const scoreData = categories
                .flatMap(cat => cat.items)
                .map(item => ({
                    item_id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
                    score: scores[item.id] ?? null,
                    remarks: remarks[item.id] ?? '',
                }));

            await axios.post(`/evaluator/evaluations/${project.id}/save`, {
                scores: scoreData,
                final_remarks: finalRemarks,
            });

            setMessage({ type: 'success', text: 'Evaluation saved successfully!' });
            setTimeout(() => {
                window.location.href = '/evaluator/evaluations';
            }, 1200);
        } catch (error: any) {
            const respMessage = error.response?.data?.message || 'Failed to save evaluation';

            // If the save failed because the evaluation was already completed on the server,
            // show the server message and refresh so the UI reflects the locked state.
            if (error.response?.status === 403 && /completed/i.test(respMessage)) {
                setMessage({ type: 'error', text: respMessage });
                // Give the user a moment to read the message then refresh to reflect server state
                setTimeout(() => window.location.reload(), 1200);
            } else {
                setMessage({ type: 'error', text: respMessage });
            }
        } finally {
            setSaving(false);
        }
    };

    // Submit evaluation with final action
    const handleSubmit = async () => {
        if (!finalAction) {
            setMessage({ type: 'error', text: 'Please select a Final Evaluation Decision before submitting.' });
            setTimeout(() => setMessage(null), 4000);
            return;
        }

        if (!confirm('Are you sure you want to submit this evaluation? You will not be able to edit it afterwards.')) {
            return;
        }

        setSubmitting(true);
        try {
            // First save the scores
            const scoreData = categories
                .flatMap(cat => cat.items)
                .map(item => ({
                    item_id: typeof item.id === 'string' ? parseInt(item.id, 10) : item.id,
                    score: scores[item.id] ?? null,
                    remarks: remarks[item.id] ?? '',
                }));

            await axios.post(`/evaluator/evaluations/${project.id}/save`, {
                scores: scoreData,
                final_remarks: finalRemarks,
            });

            // Then submit with final action
            await axios.post(`/evaluator/evaluations/${project.id}/submit`, {
                final_action: finalAction
            });

            setMessage({ type: 'success', text: 'Evaluation submitted successfully!' });
            setTimeout(() => {
                window.location.href = '/evaluator/evaluations';
            }, 1200);
        } catch (error: any) {
            const respMessage = error.response?.data?.message || 'Failed to submit evaluation';

            if (error.response?.status === 403 && /completed/i.test(respMessage)) {
                setMessage({ type: 'error', text: respMessage });
                setTimeout(() => window.location.reload(), 1200);
            } else {
                setMessage({ type: 'error', text: respMessage });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const tabs = [
        { id: 'info', label: 'Project Info' },
        { id: 'documents', label: 'Documents' },
        { id: 'questionnaire', label: 'Questionnaire' },
        { id: 'result', label: 'Evaluation Result' },
    ];

    return (
        <AppLayout  breadcrumbs={[{ title: 'Dashboard', href: route('evaluator.dashboard') }, { title: 'Evaluations', href: route('evaluator.evaluations.index') }, { title: 'Evaluate', href: route('evaluator.evaluations.show', project.id) }]}>
            <Head title={`Evaluate: ${project.project_code}`} />

            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                {/* Header Section */}
                <div className={combineTheme('border-b bg-white dark:bg-slate-800', themeClasses.border.primary)}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            {/* Back button and title */}
                            <div className="flex items-center gap-6">
                                {/* <Link
                                    href="/evaluator/evaluations"
                                    className={combineTheme(
                                        'p-3 rounded-xl border transition-all duration-200 hover:shadow-md', 
                                        themeClasses.border.primary,
                                        'bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600'
                                    )}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Link> */}
                                <div className="space-y-1">
                                    <h1 className={combineTheme('text-2xl font-bold tracking-tight', themeClasses.text.primary)}>
                                        {project.project_code}
                                    </h1>
                                    <p className={combineTheme('text-base', themeClasses.text.secondary)}>
                                        {project.title}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className={themeClasses.text.tertiary}>{project.organization}</span>
                                        <span className={themeClasses.text.tertiary}>•</span>
                                        <span className={themeClasses.text.tertiary}>{project.domain}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Score Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 border border-blue-200 dark:border-blue-700 rounded-2xl px-6 py-4 min-w-[160px] text-center shadow-sm">
                                <p className={combineTheme('text-xs font-medium uppercase tracking-wide mb-1', themeClasses.text.secondary)}>
                                    Total Score
                                </p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-1">
                                    {totalScore.toFixed(1)}
                                </p>
                                {scoreInterpretation && (
                                    <p className={combineTheme('text-sm font-medium', 'text-blue-700 dark:text-blue-200')}>
                                        {scoreInterpretation.interpretation}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Status Alerts */}
                    <div className="space-y-4 mb-8">
                        {/* Questionnaire Version Info */}
                        {questionnaire_version && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                    <div>
                                        <p className={combineTheme('font-semibold text-sm', 'text-amber-800 dark:text-amber-200')}>
                                            Questionnaire Version {questionnaire_version.version_number}
                                        </p>
                                        <p className={combineTheme('text-xs', 'text-amber-600 dark:text-amber-300')}>
                                            Created {new Date(questionnaire_version.created_at).toLocaleDateString()}
                                            {questionnaire_version.description && ` • ${questionnaire_version.description}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Version Integrity Info */}
                        {version_integrity && version_integrity.snapshot_integrity && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <div>
                                            <p className={combineTheme('font-semibold text-sm', 'text-green-800 dark:text-green-200')}>
                                                Version Locked & Secured
                                            </p>
                                            <p className={combineTheme('text-xs', 'text-green-600 dark:text-green-300')}>
                                                {version_integrity.categories_count} categories • {version_integrity.questions_count} questions • Max: {version_integrity.total_max_score.toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completion Status */}
                        {isCompleted && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <p className={combineTheme('font-semibold text-sm', 'text-emerald-800 dark:text-emerald-200')}>
                                            Evaluation Completed
                                        </p>
                                        {evaluation.completion_date && (
                                            <p className={combineTheme('text-xs', 'text-emerald-600 dark:text-emerald-300')}>
                                                Submitted on {new Date(evaluation.completion_date).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Admin2 Review Message */}
                        {project.status === 'review' && project.admin2_remarks && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                                <div className="space-y-2">
                                    <p className={combineTheme('font-semibold text-sm', 'text-orange-800 dark:text-orange-200')}>
                                        Admin 2 Review Required
                                    </p>
                                    <p className={combineTheme('text-sm', 'text-orange-700 dark:text-orange-300')}>
                                        {project.admin2_remarks}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Message Display */}
                        {message && (
                            <div className={combineTheme(
                                'rounded-xl p-4 border',
                                message.type === 'success' 
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                            )}>
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}
                    </div>
                    {/* Navigation Tabs */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm mb-8">
                        <div className="flex border-b border-gray-200 dark:border-slate-700">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={combineTheme(
                                        'flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset first:rounded-tl-xl last:rounded-tr-xl',
                                        activeTab === tab.id
                                            ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-b-2 border-purple-600 dark:border-purple-400'
                                            : combineTheme('hover:bg-gray-50 dark:hover:bg-slate-700', themeClasses.text.secondary)
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {/* Project Information Tab */}
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    {/* Project Details */}
                                    <div className="space-y-4">
                                        <h3 className={combineTheme('text-lg font-semibold mb-4', themeClasses.text.primary)}>
                                            Project Details
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Code</p>
                                                <p className={combineTheme('text-base', themeClasses.text.primary)}>{project.project_code}</p>
                                            </div>
                                            <div>
                                                <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Title</p>
                                                <p className={combineTheme('text-base', themeClasses.text.primary)}>{project.title}</p>
                                            </div>
                                            <div>
                                                <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Organization</p>
                                                <p className={combineTheme('text-base', themeClasses.text.primary)}>{project.organization}</p>
                                            </div>
                                            <div>
                                                <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Proponent</p>
                                                <p className={combineTheme('text-base', themeClasses.text.primary)}>{project.proponent_name}</p>
                                            </div>
                                            <div>
                                                <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Domain</p>
                                                <p className={combineTheme('text-base', themeClasses.text.primary)}>{project.domain}</p>
                                            </div>
                                            <div>
                                                <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>Implementation Phase</p>
                                                <p className={combineTheme('text-base', themeClasses.text.primary)}>{project.phase}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Description Sections */}
                                    <div className="space-y-6">
                                        {project.description && (
                                            <div>
                                                <h4 className={combineTheme('text-base font-semibold mb-3', themeClasses.text.primary)}>Description</h4>
                                                <div className={combineTheme('p-4 rounded-lg border', 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600')}>
                                                    <p className={combineTheme('text-sm whitespace-pre-wrap leading-relaxed', themeClasses.text.primary)}>{project.description}</p>
                                                </div>
                                            </div>
                                        )}

                                        {project.rationale && (
                                            <div>
                                                <h4 className={combineTheme('text-base font-semibold mb-3', themeClasses.text.primary)}>Rationale</h4>
                                                <div className={combineTheme('p-4 rounded-lg border', 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600')}>
                                                    <p className={combineTheme('text-sm whitespace-pre-wrap leading-relaxed', themeClasses.text.primary)}>{project.rationale}</p>
                                                </div>
                                            </div>
                                        )}

                                        {project.objectives && (
                                            <div>
                                                <h4 className={combineTheme('text-base font-semibold mb-3', themeClasses.text.primary)}>Objectives</h4>
                                                <div className={combineTheme('p-4 rounded-lg border', 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600')}>
                                                    <p className={combineTheme('text-sm whitespace-pre-wrap leading-relaxed', themeClasses.text.primary)}>{project.objectives}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Questionnaire Tab */}
                            {activeTab === 'questionnaire' && (
                                <div className="space-y-6">
                                    {!isCompleted && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                                            <p className={combineTheme('text-sm font-medium', 'text-blue-800 dark:text-blue-200')}>
                                                💡 Evaluation Instructions
                                            </p>
                                            <p className={combineTheme('text-xs mt-1', 'text-blue-600 dark:text-blue-300')}>
                                                Answer each question using Yes/Partly/No. Your answers are automatically saved as you go.
                                            </p>
                                        </div>
                                    )}

                                    {categories.map((category) => {
                                        const categoryScore = category.items.reduce((sum, item) => sum + (scores[item.id] ?? 0), 0);
                                        const categoryProgress = categoryScore / category.max_score * 100;
                                        
                                        return (
                                            <div key={category.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                                {/* Category Header */}
                                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 px-6 py-4 border-b border-gray-200 dark:border-slate-600">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className={combineTheme('text-lg font-semibold', themeClasses.text.primary)}>
                                                                {category.name}
                                                            </h3>
                                                            {category.description && (
                                                                <p className={combineTheme('text-sm mt-1', themeClasses.text.secondary)}>
                                                                    {category.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-right">
                                                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                                        {categoryScore.toFixed(1)}
                                                                    </p>
                                                                    <p className={combineTheme('text-xs', themeClasses.text.tertiary)}>
                                                                        / {category.max_score}
                                                                    </p>
                                                                </div>
                                                                <div className="w-16 h-16 relative">
                                                                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                                                        <path
                                                                            className="text-gray-200 dark:text-gray-600"
                                                                            stroke="currentColor"
                                                                            strokeWidth="3"
                                                                            fill="transparent"
                                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                        />
                                                                        <path
                                                                            className="text-blue-500"
                                                                            stroke="currentColor"
                                                                            strokeWidth="3"
                                                                            strokeLinecap="round"
                                                                            fill="transparent"
                                                                            strokeDasharray={`${categoryProgress}, 100`}
                                                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                        />
                                                                    </svg>
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                                                            {Math.round(categoryProgress)}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Questions */}
                                                <div className="p-6">
                                                    <div className="space-y-6">
                                                        {category.items.map((item, itemIndex) => (
                                                            <div key={item.id} className="group">
                                                                <div className="flex items-start gap-4">
                                                                    {/* Question Number */}
                                                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                                                                        {item.number}
                                                                    </div>
                                                                    
                                                                    {/* Question Content */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={combineTheme('text-base font-medium mb-4 leading-relaxed', themeClasses.text.primary)}>
                                                                            {item.question}
                                                                        </p>

                                                        {/* Score Buttons */}
                                                        <div className="flex gap-3 mb-4">
                                                            {item.score_options.map((score) => {
                                                                const isSelected = scoresMatch(scores[item.id], score);
                                                                const scoreLabel = getScoreLabel(score, item.score_options);
                                                                const buttonColor = scoreLabel === 'Yes' ? 'green' :
                                                                                  scoreLabel === 'Partly' ? 'yellow' : 'red';
                                                                
                                                                return (
                                                                    <button
                                                                        key={score}
                                                                        onClick={() => handleScoreChange(item.id, score)}
                                                                        disabled={isCompleted}
                                                                        className={combineTheme(
                                                                            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                                                                            isSelected
                                                                                ? buttonColor === 'green' ? 'bg-green-600 text-white shadow-md focus:ring-green-500'
                                                                                : buttonColor === 'yellow' ? 'bg-yellow-500 text-white shadow-md focus:ring-yellow-500'
                                                                                : 'bg-red-600 text-white shadow-md focus:ring-red-500'
                                                                                : buttonColor === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                                                : buttonColor === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                                                                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
                                                                        )}
                                                                    >
                                                                        {scoreLabel}
                                                                        <span className="ml-2 text-xs opacity-75">
                                                                            ({score >= 1 ? score.toFixed(2) : score})
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>                                                                        {/* Remarks */}
                                                                        <div>
                                                                            <textarea
                                                                                placeholder="Optional remarks for this question..."
                                                                                value={remarks[item.id] || ''}
                                                                                onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                                                                                disabled={isCompleted}
                                                                                className={combineTheme(
                                                                                    'w-full p-3 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none',
                                                                                    'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600',
                                                                                    themeClasses.text.primary
                                                                                )}
                                                                                rows={2}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Divider */}
                                                                {itemIndex < category.items.length - 1 && (
                                                                    <hr className="mt-6 border-gray-200 dark:border-slate-600" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Final Remarks Section */}
                                    <div className={combineTheme('border-2 rounded-2xl p-6', themeClasses.border.primary, 'bg-white dark:bg-slate-800/60')}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <h3 className={combineTheme('text-xl font-bold', themeClasses.text.primary)}>
                                                Final Remarks
                                            </h3>
                                        </div>
                                        <textarea
                                            placeholder="Enter your final remarks for this evaluation..."
                                            value={finalRemarks}
                                            onChange={(e) => setFinalRemarks(e.target.value)}
                                            disabled={isCompleted}
                                            className={combineTheme(
                                                'w-full p-4 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none',
                                                'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600',
                                                themeClasses.text.primary
                                            )}
                                            rows={4}
                                        />
                                    </div>

                                    {/* Final Action Selection */}
                                    {!isCompleted && (
                                        <div className={combineTheme('border-2 rounded-2xl p-6', themeClasses.border.primary, 'bg-white dark:bg-slate-800/60')}>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <h3 className={combineTheme('text-xl font-bold', themeClasses.text.primary)}>
                                                    Final Evaluation Decision
                                                </h3>
                                            </div>
                                            <p className={combineTheme('text-sm mb-6', themeClasses.text.secondary)}>
                                                Choose how you want to conclude this evaluation:
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <label className={combineTheme('flex items-center gap-3 flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all', finalAction === 'approve' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600')}>
                                                    <input
                                                        type="radio"
                                                        name="finalAction"
                                                        value="approve"
                                                        checked={finalAction === 'approve'}
                                                        onChange={(e) => setFinalAction(e.target.value as 'approve' | 'revision' | 'decline')}
                                                        className="w-5 h-5 text-green-600 cursor-pointer"
                                                    />
                                                    <div className="flex-1">
                                                        <div className={combineTheme('font-semibold', finalAction === 'approve' ? 'text-green-700 dark:text-green-300' : themeClasses.text.primary)}>
                                                            ✓ Approve
                                                        </div>
                                                        <div className={combineTheme('text-sm', finalAction === 'approve' ? 'text-green-600 dark:text-green-400' : themeClasses.text.tertiary)}>
                                                            Project meets all standards
                                                        </div>
                                                    </div>
                                                </label>

                                                <label className={combineTheme('flex items-center gap-3 flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all', finalAction === 'revision' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600')}>
                                                    <input
                                                        type="radio"
                                                        name="finalAction"
                                                        value="revision"
                                                        checked={finalAction === 'revision'}
                                                        onChange={(e) => setFinalAction(e.target.value as 'approve' | 'revision' | 'decline')}
                                                        className="w-5 h-5 text-amber-600 cursor-pointer"
                                                    />
                                                    <div className="flex-1">
                                                        <div className={combineTheme('font-semibold', finalAction === 'revision' ? 'text-amber-700 dark:text-amber-300' : themeClasses.text.primary)}>
                                                            ↻ For Revision
                                                        </div>
                                                        <div className={combineTheme('text-sm', finalAction === 'revision' ? 'text-amber-600 dark:text-amber-400' : themeClasses.text.tertiary)}>
                                                            Needs improvements or clarifications
                                                        </div>
                                                    </div>
                                                </label>

                                                <label className={combineTheme('flex items-center gap-3 flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all', finalAction === 'decline' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600')}>
                                                    <input
                                                        type="radio"
                                                        name="finalAction"
                                                        value="decline"
                                                        checked={finalAction === 'decline'}
                                                        onChange={(e) => setFinalAction(e.target.value as 'approve' | 'revision' | 'decline')}
                                                        className="w-5 h-5 text-red-600 cursor-pointer"
                                                    />
                                                    <div className="flex-1">
                                                        <div className={combineTheme('font-semibold', finalAction === 'decline' ? 'text-red-700 dark:text-red-300' : themeClasses.text.primary)}>
                                                            ✗ Decline
                                                        </div>
                                                        <div className={combineTheme('text-sm', finalAction === 'decline' ? 'text-red-600 dark:text-red-400' : themeClasses.text.tertiary)}>
                                                            Does not meet requirements
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        {/* Documents Tab */}
                        {activeTab === 'documents' && (
                            <div className="p-6">
                                {documents.length > 0 ? (
                                    <div className="space-y-4">
                                        {documents.map(doc => (
                                            <div
                                                key={doc.id}
                                                className={combineTheme('flex items-start gap-4 p-4 border rounded-lg', themeClasses.border.primary, 'hover:bg-gray-50 dark:hover:bg-slate-700')}
                                            >
                                                <div className="flex-grow">
                                                    {doc.drive_link ? (
                                                        <>
                                                            <a 
                                                                href={doc.drive_link.startsWith('http') ? doc.drive_link : `https://${doc.drive_link}`}
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="block"
                                                            >
                                                                <h3 className={combineTheme('font-bold', 'text-blue-600 dark:text-blue-400')}>
                                                                    {doc.drive_link}
                                                                </h3>
                                                            </a>
                                                            <p className={combineTheme('text-sm mt-1', themeClasses.text.secondary)}>
                                                                Supporting Documents
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <h3 className={combineTheme('font-semibold', themeClasses.text.primary)}>
                                                                {doc.file_name}
                                                            </h3>
                                                            <p className={combineTheme('text-sm mt-1', themeClasses.text.secondary)}>
                                                                {doc.document_type}
                                                            </p>
                                                            {doc.description && (
                                                                <p className={combineTheme('text-sm mt-2', themeClasses.text.secondary)}>
                                                                    {doc.description}
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                    <p className={combineTheme('text-xs mt-2', themeClasses.text.tertiary)}>
                                                        Uploaded: {doc.upload_date}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {doc.file_path && (
                                                        <a
                                                            href={`/evaluator/evaluations/download/${doc.id}`}
                                                            className={combineTheme('px-3 py-2 text-sm font-medium rounded', themeClasses.link.primary)}
                                                        >
                                                            Download
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className={combineTheme('text-center py-8', themeClasses.text.tertiary)}>
                                        No documents uploaded
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Evaluation Result Tab */}
                        {activeTab === 'result' && (
                            <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                {/* Header with Total Score */}
                                <div className="mb-8">
                                    <div className="text-center mb-8">
                                        <h2 className={combineTheme('text-3xl font-bold mb-2', themeClasses.text.primary)}>
                                            Evaluation Results
                                        </h2>
                                        <p className={combineTheme('text-lg', themeClasses.text.secondary)}>
                                            Comprehensive scoring summary and assessment
                                        </p>
                                    </div>

                                    {/* Total Score Card */}
                                    <div className={combineTheme('border-2 rounded-3xl p-8 mb-8', 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700 shadow-lg')}>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-8 mb-6">
                                                <div className="text-center">
                                                    <p className={combineTheme('text-sm font-semibold mb-2', themeClasses.text.tertiary)}>
                                                        TOTAL SCORE
                                                    </p>
                                                    <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                                        {totalScore.toFixed(1)}
                                                    </p>
                                                    <p className={combineTheme('text-lg', themeClasses.text.secondary)}>
                                                        out of {maxTotalScore.toFixed(0)} points
                                                    </p>
                                                </div>
                                                
                                                <div className="relative">
                                                    <div className="relative w-24 h-24">
                                                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                                                            <path
                                                                d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeDasharray="100,100"
                                                                className="text-blue-200 dark:text-blue-800"
                                                            />
                                                            <path
                                                                d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                                strokeDasharray={`${Math.min(totalPercentage, 100)},100`}
                                                                className="text-blue-600 dark:text-blue-400"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                                {Math.round(totalPercentage)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {scoreInterpretation && (
                                                <div className={combineTheme('p-6 rounded-2xl', 'bg-white dark:bg-slate-800/60 border border-blue-200 dark:border-blue-700')}>
                                                    <div className="flex items-center justify-center gap-3 mb-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center">
                                                            <Award className="w-4 h-4" />
                                                        </div>
                                                        <h3 className={combineTheme('text-2xl font-bold', themeClasses.text.primary)}>
                                                            {scoreInterpretation.interpretation}
                                                        </h3>
                                                    </div>
                                                    <p className={combineTheme('text-base leading-relaxed', themeClasses.text.secondary)}>
                                                        {scoreInterpretation.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Category Breakdown */}
                                <div className="mb-8">
                                    <h3 className={combineTheme('text-2xl font-bold mb-6', themeClasses.text.primary)}>
                                        Category Breakdown
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {categories.map((category, index) => {
                                            const catScore = categoryScores[category.id];
                                            const categoryPercentage = catScore.max > 0 ? (catScore.total / catScore.max) * 100 : 0;
                                            
                                            return (
                                                <div
                                                    key={`result-${category.id}`}
                                                    className={combineTheme('p-6 rounded-2xl border-2', themeClasses.border.primary, 'bg-white dark:bg-slate-800/60 hover:shadow-lg transition-all')}
                                                >
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <h4 className={combineTheme('font-bold text-lg', themeClasses.text.primary)}>
                                                            {category.name}
                                                        </h4>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className={combineTheme('text-2xl font-bold', themeClasses.text.primary)}>
                                                                {catScore.total.toFixed(1)}
                                                            </span>
                                                            <span className={combineTheme('text-sm', themeClasses.text.secondary)}>
                                                                / {catScore.max.toFixed(0)} pts
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="relative">
                                                            <div className={combineTheme('w-full rounded-full h-3', 'bg-gray-200 dark:bg-slate-600')}>
                                                                <div
                                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                                                    style={{ width: `${Math.min(categoryPercentage, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="absolute -top-6 right-0 text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                {Math.round(categoryPercentage)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Score Range Reference */}
                                {interpretations.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className={combineTheme('text-2xl font-bold mb-6', themeClasses.text.primary)}>
                                            Scoring Reference Guide
                                        </h3>
                                        <div className={combineTheme('border-2 rounded-2xl p-6', themeClasses.border.primary, 'bg-white dark:bg-slate-800/60')}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {interpretations.map((interp, idx) => {
                                                    const isCurrentRange = scoreInterpretation?.interpretation === interp.interpretation;
                                                    
                                                    return (
                                                        <div 
                                                            key={idx} 
                                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                                isCurrentRange 
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                                                                    : combineTheme('border-gray-200 dark:border-slate-600', 'bg-gray-50 dark:bg-slate-700/30')
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className={combineTheme('font-bold text-lg', isCurrentRange ? 'text-blue-700 dark:text-blue-300' : themeClasses.text.primary)}>
                                                                    {interp.interpretation}
                                                                    {isCurrentRange && (
                                                                        <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs">
                                                                            ✓
                                                                        </span>
                                                                    )}
                                                                </h4>
                                                                <span className={combineTheme('font-mono text-sm font-bold px-3 py-1 rounded-full', isCurrentRange ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300')}>
                                                                    {interp.min}-{interp.max}
                                                                </span>
                                                            </div>
                                                            <p className={combineTheme('text-sm leading-relaxed', isCurrentRange ? 'text-blue-600 dark:text-blue-300' : themeClasses.text.secondary)}>
                                                                {interp.description}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Completion Status */}
                                <div>
                                    {evaluation.is_completed ? (
                                        <div className={combineTheme('border-2 rounded-2xl p-6', 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700')}>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-green-600 dark:bg-green-500 text-white flex items-center justify-center">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className={combineTheme('text-xl font-bold', 'text-green-900 dark:text-green-100')}>
                                                        Evaluation Completed
                                                    </h3>
                                                    <p className={combineTheme('text-sm', 'text-green-700 dark:text-green-200')}>
                                                        Successfully submitted and locked
                                                    </p>
                                                </div>
                                            </div>
                                            {evaluation.completion_date && (
                                                <div className={combineTheme('p-4 rounded-xl', 'bg-green-100 dark:bg-green-900/50')}>
                                                    <p className={combineTheme('text-sm font-medium', 'text-green-800 dark:text-green-100')}>
                                                        <Clock className="inline w-4 h-4 mr-2" />
                                                        Completed: {new Date(evaluation.completion_date).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className={combineTheme('border-2 rounded-2xl p-6', 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700')}>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center">
                                                        <Clock className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className={combineTheme('text-xl font-bold', 'text-amber-900 dark:text-amber-100')}>
                                                            In Progress
                                                        </h3>
                                                        <p className={combineTheme('text-sm', 'text-amber-700 dark:text-amber-200')}>
                                                            Evaluation not yet submitted
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={combineTheme('p-4 rounded-xl', 'bg-amber-100 dark:bg-amber-900/50')}>
                                                    <p className={combineTheme('text-sm', 'text-amber-800 dark:text-amber-100')}>
                                                        Complete the questionnaire and submit to finalize this evaluation.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <button
                                                    onClick={handleSave}
                                                    disabled={saving || submitting}
                                                    className={combineTheme('group flex items-center justify-center gap-3 px-8 py-4 border-2 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none', themeClasses.border.primary, themeClasses.text.primary, 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700')}
                                                >
                                                    <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                    <span>{saving ? 'Saving Progress...' : 'Save Progress'}</span>
                                                    {saving && (
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                    )}
                                                </button>

                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={saving || submitting || !finalAction}
                                                    className={combineTheme('group flex items-center justify-center gap-3 px-8 py-4 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none', 'bg-[#5a189a] hover:bg-[#4a0e7a]')}
                                                >
                                                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    <span>{submitting ? 'Submitting Evaluation...' : 'Submit Final Evaluation'}</span>
                                                    {submitting && (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Warning Notice */}
                                            <div className={combineTheme('p-4 rounded-xl border', 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700')}>
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                                                        !
                                                    </div>
                                                    <div>
                                                        <p className={combineTheme('text-sm font-semibold mb-1', 'text-amber-800 dark:text-amber-200')}>
                                                            Important Notice
                                                        </p>
                                                        <p className={combineTheme('text-sm', 'text-amber-700 dark:text-amber-300')}>
                                                            Once submitted, this evaluation cannot be modified. Please review all scores and remarks before final submission.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>


                            </div>
                        )}
                    </div>

                    {/* Tab Navigation Buttons */}
                    <div className="flex justify-between items-center mt-6">
                        {/* <button
                            onClick={() => {
                                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                if (currentIndex > 0) {
                                    setActiveTab(tabs[currentIndex - 1].id);
                                }
                            }}
                            disabled={activeTab === 'info'}
                            className={combineTheme('flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200', 
                                activeTab === 'info' 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-700 text-gray-400'
                                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                            )}
                        >
                            ← Previous
                        </button> */}

                        {/* <button
                            onClick={() => {
                                const currentIndex = tabs.findIndex(t => t.id === activeTab);
                                if (currentIndex < tabs.length - 1) {
                                    setActiveTab(tabs[currentIndex + 1].id);
                                }
                            }}
                            disabled={activeTab === 'result'}
                            className={combineTheme('flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200',
                                activeTab === 'result'
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-700 text-gray-400'
                                    : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                            )}
                        >
                            Next →
                        </button> */}
                    </div>
                </div>

                {/* Action Buttons or Completion Message */}
                <div className="px-8 pb-8">
                    {isCompleted && (
                        <div className={combineTheme('border-2 rounded-2xl p-8', 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 border-green-300 dark:border-green-700 shadow-lg')}>
                            <div className="flex items-center gap-6">
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 rounded-2xl bg-green-600 dark:bg-green-500 text-white flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className={combineTheme('text-2xl font-bold mb-2', 'text-green-900 dark:text-green-100')}>
                                        ✓ Evaluation Successfully Submitted
                                    </h3>
                                    <p className={combineTheme('text-base leading-relaxed mb-2', 'text-green-800 dark:text-green-100')}>
                                        This evaluation has been completed and locked for data integrity. All scores and remarks have been saved permanently and can no longer be modified.
                                    </p>
                                    {evaluation.completion_date && (
                                        <div className="flex items-center gap-2 mt-4">
                                            <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            <span className={combineTheme('text-sm font-medium', 'text-green-700 dark:text-green-200')}>
                                                Submitted: {new Date(evaluation.completion_date).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-shrink-0">
                                    <div className={combineTheme('px-6 py-3 rounded-xl text-center', 'bg-green-100 dark:bg-green-800/50')}>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {totalScore.toFixed(1)}
                                        </div>
                                        <div className={combineTheme('text-sm', 'text-green-700 dark:text-green-300')}>
                                            Final Score
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </AppLayout>
    );
}
