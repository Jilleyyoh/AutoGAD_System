import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';
import { combineTheme, themeClasses } from '@/lib/theme-classes';

interface VersionCategory {
    id: number;
    category_name: string;
    max_score: number;
    questions: Array<{
        id: number;
        question: string;
        max_score: number;
        score_options: string;
    }>;
}

interface VersionSnapshot {
    categories: VersionCategory[];
    total_points: number;
}

interface VersionData {
    id: number;
    version_number: string;
    created_at: string;
    snapshot: VersionSnapshot;
}

interface VersionComparisonProps {
    version1: VersionData;
    version2: VersionData;
    onClose?: () => void;
}

/**
 * VersionComparison Component
 * Displays side-by-side comparison of two questionnaire versions
 * Highlights changes in categories, questions, and scoring
 */
export default function VersionComparison({
    version1,
    version2,
    onClose,
}: VersionComparisonProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    const toggleCategory = (categoryId: number) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    // Parse snapshot data
    const categories1 = version1.snapshot.categories || [];
    const categories2 = version2.snapshot.categories || [];

    // Detect changes
    const getCategoryChanges = (cat1: VersionCategory, cat2: VersionCategory) => {
        const changes = {
            name_changed: cat1.category_name !== cat2.category_name,
            score_changed: cat1.max_score !== cat2.max_score,
            questions_changed: cat1.questions.length !== cat2.questions.length,
        };
        return Object.values(changes).some(change => change);
    };

    const getQuestionChanges = (q1: any, q2: any) => {
        const changes = {
            text_changed: q1.question !== q2.question,
            score_changed: q1.max_score !== q2.max_score,
            options_changed: q1.score_options !== q2.score_options,
        };
        return Object.values(changes).some(change => change);
    };

    // Get all category IDs for comparison
    const allCategoryIds = new Set([
        ...categories1.map(c => c.id),
        ...categories2.map(c => c.id),
    ]);

    return (
        <div className={combineTheme('rounded-lg shadow', themeClasses.card.base)}>
            {/* Header */}
            <div className={combineTheme('border-b px-6 py-6', themeClasses.table.header)}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={combineTheme('text-2xl font-bold', themeClasses.text.primary)}>
                        Version Comparison
                    </h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={combineTheme(
                                'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            )}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Version Headers */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={combineTheme('rounded p-4', 'bg-blue-50 dark:bg-blue-900')}>
                        <p className={combineTheme('text-sm font-medium', 'text-blue-600 dark:text-blue-300')}>
                            Earlier Version
                        </p>
                        <p className={combineTheme('text-lg font-bold mt-1', themeClasses.text.primary)}>
                            v{version1.version_number}
                        </p>
                        <p className={combineTheme('text-xs mt-1', themeClasses.text.secondary)}>
                            Created {new Date(version1.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    <div className={combineTheme('rounded p-4', 'bg-green-50 dark:bg-green-900')}>
                        <p className={combineTheme('text-sm font-medium', 'text-green-600 dark:text-green-300')}>
                            Later Version
                        </p>
                        <p className={combineTheme('text-lg font-bold mt-1', themeClasses.text.primary)}>
                            v{version2.version_number}
                        </p>
                        <p className={combineTheme('text-xs mt-1', themeClasses.text.secondary)}>
                            Created {new Date(version2.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Summary */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div className={combineTheme('p-3 rounded', themeClasses.card.base)}>
                        <p className={combineTheme('font-medium', themeClasses.text.secondary)}>Total Points</p>
                        <p className={combineTheme('text-lg font-bold mt-1', themeClasses.text.primary)}>
                            {version1.snapshot.total_points} → {version2.snapshot.total_points}
                        </p>
                    </div>
                    <div className={combineTheme('p-3 rounded', themeClasses.card.base)}>
                        <p className={combineTheme('font-medium', themeClasses.text.secondary)}>Categories</p>
                        <p className={combineTheme('text-lg font-bold mt-1', themeClasses.text.primary)}>
                            {categories1.length} → {categories2.length}
                        </p>
                    </div>
                    <div className={combineTheme('p-3 rounded', themeClasses.card.base)}>
                        <p className={combineTheme('font-medium', themeClasses.text.secondary)}>Questions</p>
                        <p className={combineTheme('text-lg font-bold mt-1', themeClasses.text.primary)}>
                            {categories1.reduce((sum, c) => sum + c.questions.length, 0)} →{' '}
                            {categories2.reduce((sum, c) => sum + c.questions.length, 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Categories Comparison */}
            <div className={combineTheme('divide-y', themeClasses.table.border)}>
                {Array.from(allCategoryIds).map((categoryId: number) => {
                    const cat1 = categories1.find(c => c.id === categoryId);
                    const cat2 = categories2.find(c => c.id === categoryId);

                    const hasChanges = cat1 && cat2 && getCategoryChanges(cat1, cat2);
                    const isExpanded = expandedCategories.has(categoryId);

                    return (
                        <div key={categoryId} className={combineTheme(
                            'transition-colors',
                            hasChanges ? 'bg-yellow-50 dark:bg-yellow-950' : ''
                        )}>
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(categoryId)}
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 text-left">
                                    {hasChanges && (
                                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                    )}
                                    {!hasChanges && !cat1 && (
                                        <span className="text-green-600 dark:text-green-400">✓ New</span>
                                    )}
                                    {!hasChanges && !cat2 && (
                                        <span className="text-red-600 dark:text-red-400">✗ Removed</span>
                                    )}

                                    {cat1 ? (
                                        <div>
                                            <p className={combineTheme('font-semibold', themeClasses.text.primary)}>
                                                {cat1.category_name}
                                            </p>
                                            {cat1.max_score !== cat2?.max_score && (
                                                <p className={combineTheme('text-sm', themeClasses.text.secondary)}>
                                                    Points: {cat1.max_score} → {cat2?.max_score}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className={combineTheme('font-semibold', themeClasses.text.primary)}>
                                                {cat2?.category_name}
                                            </p>
                                            <p className={combineTheme('text-sm', themeClasses.text.secondary)}>
                                                New: {cat2?.max_score} points
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>

                            {/* Questions Details */}
                            {isExpanded && (
                                <div className={combineTheme('px-6 py-4 space-y-3 border-t', themeClasses.table.border)}>
                                    {cat1 && cat2 && (
                                        <>
                                            {/* Existing Questions */}
                                            {cat1.questions.map((q1, idx) => {
                                                const q2 = cat2.questions[idx];
                                                if (!q2) {
                                                    return (
                                                        <div key={q1.id} className={combineTheme('p-3 rounded', 'bg-red-50 dark:bg-red-950')}>
                                                            <p className={combineTheme('text-sm font-medium', 'text-red-700 dark:text-red-300')}>
                                                                ✗ Removed Question
                                                            </p>
                                                            <p className={combineTheme('text-sm mt-1', themeClasses.text.primary)}>
                                                                {q1.question} ({q1.max_score} pts)
                                                            </p>
                                                        </div>
                                                    );
                                                }

                                                const hasQChanges = getQuestionChanges(q1, q2);

                                                return (
                                                    <div
                                                        key={q1.id}
                                                        className={combineTheme(
                                                            'p-3 rounded',
                                                            hasQChanges ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-50 dark:bg-slate-700'
                                                        )}
                                                    >
                                                        {hasQChanges && (
                                                            <p className={combineTheme('text-xs font-semibold', 'text-yellow-700 dark:text-yellow-300')}>
                                                                CHANGED
                                                            </p>
                                                        )}
                                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                                            <div>
                                                                <p className={combineTheme('text-xs font-medium', themeClasses.text.tertiary)}>
                                                                    v{version1.version_number}
                                                                </p>
                                                                <p className={combineTheme('text-sm', themeClasses.text.primary)}>
                                                                    {q1.question}
                                                                </p>
                                                                <p className={combineTheme('text-xs', themeClasses.text.secondary)}>
                                                                    {q1.max_score} points
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className={combineTheme('text-xs font-medium', themeClasses.text.tertiary)}>
                                                                    v{version2.version_number}
                                                                </p>
                                                                <p className={combineTheme('text-sm', themeClasses.text.primary)}>
                                                                    {q2.question}
                                                                </p>
                                                                <p className={combineTheme('text-xs', themeClasses.text.secondary)}>
                                                                    {q2.max_score} points
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* New Questions */}
                                            {cat2.questions.slice(cat1.questions.length).map((q2) => (
                                                <div key={q2.id} className={combineTheme('p-3 rounded', 'bg-green-50 dark:bg-green-950')}>
                                                    <p className={combineTheme('text-sm font-medium', 'text-green-700 dark:text-green-300')}>
                                                        ✓ New Question
                                                    </p>
                                                    <p className={combineTheme('text-sm mt-1', themeClasses.text.primary)}>
                                                        {q2.question} ({q2.max_score} pts)
                                                    </p>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {cat1 && !cat2 && (
                                        <p className={combineTheme('text-sm', themeClasses.text.secondary)}>
                                            Category removed in v{version2.version_number}
                                        </p>
                                    )}

                                    {!cat1 && cat2 && (
                                        <p className={combineTheme('text-sm', themeClasses.text.secondary)}>
                                            Category added in v{version2.version_number}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
