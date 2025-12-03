import React from 'react';
import { Clock, Archive, CheckCircle, AlertCircle } from 'lucide-react';
import { combineTheme, themeClasses } from '@/lib/theme-classes';

interface VersionData {
    id: number;
    version_number: string;
    status: 'active' | 'archived' | 'draft';
    is_active: boolean;
    created_at: string;
    description?: string;
    evaluation_count?: number;
}

interface VersionInfoProps {
    version: VersionData;
    compact?: boolean;
    showEvaluationCount?: boolean;
    showActions?: boolean;
    fullWidth?: boolean;
    onCompare?: () => void;
    onView?: () => void;
}

/**
 * VersionInfo Component
 * Displays questionnaire version information with metadata and status indicators
 */
export default function VersionInfo({
    version,
    compact = false,
    showEvaluationCount = false,
    showActions = false,
    fullWidth = false,
    onCompare,
    onView,
}: VersionInfoProps) {
    // Format date to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get status badge styling
    const getStatusBadge = (status: string, isActive: boolean) => {
        if (isActive) {
            return (
                <span className={combineTheme(
                    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                )}>
                    <CheckCircle className="w-4 h-4" />
                    Active
                </span>
            );
        }

        if (status === 'archived') {
            return (
                <span className={combineTheme(
                    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                )}>
                    <Archive className="w-4 h-4" />
                    Archived
                </span>
            );
        }

        return (
            <span className={combineTheme(
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium',
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
            )}>
                <AlertCircle className="w-4 h-4" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Compact view - minimal information
    if (compact) {
        return (
            <div className={combineTheme(`${fullWidth ? 'flex' : 'inline-flex'} items-center gap-3 px-4 py-2 rounded-lg`, themeClasses.card.base)}>
                <div>
                    <p className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>
                        Questionnaire Version
                    </p>
                    <p className={combineTheme('text-lg font-bold', themeClasses.text.primary)}>
                        {version.version_number}
                    </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className={combineTheme('text-xs', themeClasses.text.muted)}>
                        {formatDate(version.created_at)}
                    </span>
                </div>
                <div className="ml-auto">
                    {getStatusBadge(version.status, version.is_active)}
                </div>
            </div>
        );
    }

    // Full view - detailed information
    return (
        <div className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b" style={{
                borderColor: 'var(--color-border)',
            }}>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className={combineTheme('text-2xl font-bold', themeClasses.text.primary)}>
                            Version {version.version_number}
                        </h3>
                        {getStatusBadge(version.status, version.is_active)}
                    </div>
                    {version.description && (
                        <p className={combineTheme('text-sm', themeClasses.text.secondary)}>
                            {version.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {/* Created Date */}
                <div>
                    <p className={combineTheme('text-xs font-medium uppercase tracking-wide', themeClasses.text.tertiary)}>
                        Created
                    </p>
                    <p className={combineTheme('mt-1 text-sm font-medium', themeClasses.text.primary)}>
                        {formatDate(version.created_at)}
                    </p>
                </div>

                {/* Status */}
                <div>
                    <p className={combineTheme('text-xs font-medium uppercase tracking-wide', themeClasses.text.tertiary)}>
                        Status
                    </p>
                    <p className={combineTheme('mt-1 text-sm font-medium capitalize', themeClasses.text.primary)}>
                        {version.status}
                    </p>
                </div>

                {/* Active Status */}
                <div>
                    <p className={combineTheme('text-xs font-medium uppercase tracking-wide', themeClasses.text.tertiary)}>
                        Active
                    </p>
                    <p className={combineTheme('mt-1 text-sm font-medium', version.is_active ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400')}>
                        {version.is_active ? 'Yes' : 'No'}
                    </p>
                </div>

                {/* Evaluation Count */}
                {showEvaluationCount && (
                    <div>
                        <p className={combineTheme('text-xs font-medium uppercase tracking-wide', themeClasses.text.tertiary)}>
                            Evaluations Using This Version
                        </p>
                        <p className={combineTheme('mt-1 text-sm font-bold text-blue-600 dark:text-blue-400')}>
                            {version.evaluation_count || 0}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            {showActions && (onView || onCompare) && (
                <div className="flex gap-3 pt-4 border-t" style={{
                    borderColor: 'var(--color-border)',
                }}>
                    {onView && (
                        <button
                            onClick={onView}
                            className={combineTheme(
                                'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                                'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                            )}
                        >
                            View Details
                        </button>
                    )}
                    {onCompare && (
                        <button
                            onClick={onCompare}
                            className={combineTheme(
                                'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                                'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                            )}
                        >
                            Compare Versions
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
