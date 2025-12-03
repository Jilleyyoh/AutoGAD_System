import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ChevronLeft, Clock, Archive, Eye, MoreVertical, Trash2 } from 'lucide-react';
import VersionInfo from '@/components/version-info';
import { combineTheme, themeClasses } from '@/lib/theme-classes';

interface VersionData {
    id: number;
    version_number: string;
    status: 'active' | 'archived' | 'draft';
    is_active: boolean;
    created_at: string;
    description?: string;
    evaluation_count: number;
    snapshot: {
        categories: any[];
        questions?: any[];
        question_count?: number;
        category_count?: number;
        total_points?: number;
        total_max_score?: number;
    };
}

interface Props {
    versions: VersionData[];
}

export default function VersionHistory({ versions }: Props) {
    const [selectedVersion, setSelectedVersion] = useState<VersionData | null>(null);
    const [menuOpen, setMenuOpen] = useState<number | null>(null);

    const activeVersion = versions.find(v => v.is_active);

    // Sort versions by created_at descending
    const sortedVersions = [...versions].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <AppLayout>
            <Head title="Questionnaire Version History" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className={combineTheme('px-4 py-6 sm:px-0', themeClasses.text.primary)}>
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Link
                                href="/admin2/settings"
                                className={combineTheme('p-2 rounded-lg transition-colors', 'hover:bg-gray-100 dark:hover:bg-slate-700')}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Link>
                            <div>
                                <h1 className={combineTheme('text-3xl font-bold', themeClasses.text.primary)}>
                                    Questionnaire Version History
                                </h1>
                                <p className={combineTheme('mt-1', themeClasses.text.secondary)}>
                                    View all versions and changes to your questionnaire
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
                                    <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>
                                        Total Versions
                                    </p>
                                    <p className={combineTheme('text-3xl font-bold mt-2', themeClasses.text.primary)}>
                                        {versions.length}
                                    </p>
                                </div>

                                <div className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
                                    <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>
                                        Active Version
                                    </p>
                                    <p className={combineTheme('text-3xl font-bold mt-2 text-green-600 dark:text-green-400')}>
                                        v{activeVersion?.version_number || 'N/A'}
                                    </p>
                                </div>

                                <div className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
                                    <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>
                                        Active Version Uses
                                    </p>
                                    <p className={combineTheme('text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400')}>
                                        {activeVersion?.evaluation_count || 0}
                                    </p>
                                </div>

                                <div className={combineTheme('rounded-lg shadow p-6', themeClasses.card.base)}>
                                    <p className={combineTheme('text-sm font-medium', themeClasses.text.tertiary)}>
                                        Total Questions
                                    </p>
                                    <p className={combineTheme('text-3xl font-bold mt-2', themeClasses.text.primary)}>
                                        {activeVersion?.snapshot.questions?.length || activeVersion?.snapshot.question_count || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Versions Timeline */}
                            <div className={combineTheme('rounded-lg shadow overflow-hidden', themeClasses.card.base)}>
                                <div className={combineTheme('px-6 py-4 border-b font-semibold', themeClasses.table.header)}>
                                    Version Timeline
                                </div>

                                <div className={combineTheme('divide-y', themeClasses.table.border)}>
                                    {sortedVersions.map((version, idx) => (
                                        <div
                                            key={version.id}
                                            className={combineTheme(
                                                'p-6 transition-colors',
                                                idx === 0 ? 'bg-blue-50 dark:bg-blue-950' : ''
                                            )}
                                        >
                                            {/* Main Row */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className={combineTheme('text-lg font-semibold', themeClasses.text.primary)}>
                                                            Version {version.version_number}
                                                        </h3>
                                                        <div className="flex gap-2">
                                                            {version.is_active && (
                                                                <span className={combineTheme(
                                                                    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                                                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                                                )}>
                                                                    ✓ Active
                                                                </span>
                                                            )}
                                                            {version.status === 'archived' && (
                                                                <span className={combineTheme(
                                                                    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                                                                )}>
                                                                    <Archive className="w-3 h-3" />
                                                                    Archived
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {version.description && (
                                                        <p className={combineTheme('text-sm', themeClasses.text.secondary)}>
                                                            {version.description}
                                                        </p>
                                                    )}

                                                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                                        <div>
                                                            <p className={combineTheme('font-medium', themeClasses.text.tertiary)}>
                                                                Created
                                                            </p>
                                                            <p className={combineTheme('text-xs', themeClasses.text.primary)}>
                                                                {new Date(version.created_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className={combineTheme('font-medium', themeClasses.text.tertiary)}>
                                                                Categories
                                                            </p>
                                                            <p className={combineTheme('text-xs font-bold', 'text-blue-600 dark:text-blue-400')}>
                                                                {version.snapshot.categories.length}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className={combineTheme('font-medium', themeClasses.text.tertiary)}>
                                                                Questions
                                                            </p>
                                                            <p className={combineTheme('text-xs font-bold', 'text-blue-600 dark:text-blue-400')}>
                                                                {version.snapshot.questions?.length || version.snapshot.question_count || 0}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions Menu */}
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setMenuOpen(menuOpen === version.id ? null : version.id)}
                                                        className={combineTheme(
                                                            'p-2 rounded-lg transition-colors',
                                                            'hover:bg-gray-200 dark:hover:bg-slate-700'
                                                        )}
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>

                                                    {menuOpen === version.id && (
                                                        <div className={combineTheme(
                                                            'absolute right-0 mt-1 w-48 rounded-lg shadow-lg z-10',
                                                            themeClasses.card.base
                                                        )}>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedVersion(version);
                                                                    setMenuOpen(null);
                                                                }}
                                                                className={combineTheme(
                                                                    'w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-t-lg',
                                                                    themeClasses.text.primary
                                                                )}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                View Details
                                                            </button>
                                                            {version.status !== 'archived' && !version.is_active && (
                                                                <button
                                                                    onClick={() => {
                                                                        // Archive logic would go here
                                                                        setMenuOpen(null);
                                                                    }}
                                                                    className={combineTheme(
                                                                        'w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-700',
                                                                        themeClasses.text.primary
                                                                    )}
                                                                >
                                                                    <Archive className="w-4 h-4" />
                                                                    Archive
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Selected Version Detail */}
                                            {selectedVersion?.id === version.id && (
                                                <div className={combineTheme(
                                                    'mt-4 pt-4 border-t',
                                                    themeClasses.table.border
                                                )}>
                                                    <VersionInfo
                                                        version={version}
                                                        showEvaluationCount={true}
                                                        showActions={true}
                                                        onCompare={() => {
                                                            // Select this for comparison
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                </div>
            </div>
        </AppLayout>
    );
}
