import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { themeClasses, combineTheme } from '@/lib/theme-classes';
import { ClipboardList, FileText, Eye } from 'lucide-react';
import { formatPhase, formatStatus } from '@/lib/format-label';

interface Document {
  id: number;
  type?: string;
  description?: string | null;
  file_path?: string | null; // Public URL (may be null)
  file_name?: string | null;
  download_route?: string; // Backend route for secure download
  drive_link?: string; // External link for supporting documents
}

interface ProjectDomain {
  id: number;
  domain_name: string;
}

interface Project {
  id: number;
  project_code?: string;
  title?: string;
  description?: string | null;
  phase?: string | null;
  status?: string;
  status_id?: number;
  created_at?: string;
  domain_expertise?: ProjectDomain | null;
  documents: Document[];
  rationale?: string | null;
  objectives?: string | null;
  evaluations?: Array<{
    id: number;
    total_score?: number;
    remarks?: string;
    status_name?: string;
    interpretation?: {
      interpretation: string;
      description: string;
    };
    evaluator?: string;
    created_at?: string;
  }>;
}

interface Props {
  project: Project;
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

export default function Show({ project }: Props) {
  if (!project) {
    return <div className="p-6 text-red-600">Project data unavailable.</div>;
  }

  const [activeTab, setActiveTab] = useState('info');
  const statusLabel = formatStatus(project.status || 'pending');
  const projectCode = project.project_code || `PAP-${project.id}`;
  const evaluations = project.evaluations || [];

  const formatDocumentLabel = (value?: string | null) => {
    if (!value) return 'Document';
    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (match) => match.toUpperCase());
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: route('proponent.dashboard') },
        { title: 'Track Submissions', href: route('proponent.pap.submissions') },
        { title: projectCode, href: route('proponent.pap.show', project.id) },
      ]}
    >
      <Head title={`Submission ${projectCode}`} />

      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className={combineTheme('text-2xl font-semibold', themeClasses.text.primary)}>{projectCode}</h1>
              <p className={combineTheme('mt-1 text-sm', themeClasses.text.secondary)}>
                Submitted {project.created_at ? new Date(project.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
              project.status === 'pending' ? combineTheme('', themeClasses.badge.yellow) :
              project.status === 'under_review' ? combineTheme('', themeClasses.badge.blue) :
              project.status === 'approved' ? combineTheme('', themeClasses.badge.green) :
              project.status === 'rejected' ? combineTheme('', themeClasses.badge.red) :
              project.status === 'certified' ? combineTheme('', themeClasses.badge.purple) : combineTheme('', themeClasses.badge.blue)
            }`}>{statusLabel}</span>
          </div>

          <div className={combineTheme('shadow-sm rounded-md p-6', themeClasses.card.base)}>
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

            {activeTab === 'info' && (
              <div className="space-y-4">
                <h2 className={combineTheme('text-lg font-medium', themeClasses.text.primary)}>Project Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className={combineTheme('', themeClasses.text.secondary)}>Title</div>
                    <div className={combineTheme('font-medium', themeClasses.text.primary)}>{project.title || '—'}</div>
                  </div>
                  <div>
                    <div className={combineTheme('', themeClasses.text.secondary)}>Domain</div>
                    <div className={combineTheme('font-medium', themeClasses.text.primary)}>{project.domain_expertise?.domain_name || '—'}</div>
                  </div>
                  <div>
                    <div className={combineTheme('', themeClasses.text.secondary)}>Implementation Phase</div>
                    <div className={combineTheme('font-medium', themeClasses.text.primary)}>{formatPhase(project.phase || '—')}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={combineTheme('text-sm mb-1', themeClasses.text.secondary)}>Description</div>
                  <p className={combineTheme('whitespace-pre-line text-sm', themeClasses.text.primary)}>{project.description || '—'}</p>
                </div>
                <div>
                  <div className={combineTheme('text-sm mb-1', themeClasses.text.secondary)}>Rationale</div>
                  <p className={combineTheme('whitespace-pre-line text-sm', themeClasses.text.primary)}>{project.rationale || '—'}</p>
                </div>
                <div>
                  <div className={combineTheme('text-sm mb-1', themeClasses.text.secondary)}>Objectives</div>
                  <p className={combineTheme('whitespace-pre-line text-sm', themeClasses.text.primary)}>{project.objectives || '—'}</p>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h2 className={combineTheme('text-lg font-medium', themeClasses.text.primary)}>Documents</h2>
                {(project.documents || []).length === 0 && (
                  <p className={combineTheme('text-sm', themeClasses.text.secondary)}>No documents uploaded.</p>
                )}
                <ul className={combineTheme('', themeClasses.table.border)}>
                  {(project.documents || []).map((document) => {
                    const isLink = !!document.drive_link;
                    const displayType = isLink && document.type === 'supporting'
                      ? 'Supporting Documents (Link)'
                      : formatDocumentLabel(document.type);
                    const displayName = document.type ? displayType : (document.file_name || displayType);

                    return (
                      <li key={document.id} className="py-3 flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <div className={combineTheme('font-medium', themeClasses.text.primary)}>{displayName}</div>
                          {document.description && (
                            <div className={combineTheme('text-xs mt-0.5', themeClasses.text.tertiary)}>{document.description}</div>
                          )}
                          {isLink && document.drive_link ? (
                            <a
                              href={document.drive_link.startsWith('http') ? document.drive_link : `https://${document.drive_link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={combineTheme('text-xs mt-0.5 text-blue-600 dark:text-blue-400 hover:underline break-all', themeClasses.text.tertiary)}
                            >
                              {document.drive_link}
                            </a>
                          ) : (
                            document.type && <div className={combineTheme('text-xs mt-0.5', themeClasses.text.tertiary)}>{displayType}</div>
                          )}
                        </div>
                        {!isLink && (document.download_route || document.file_path) && (
                          <a
                            href={document.download_route || document.file_path || '#'}
                            className={combineTheme('ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm', themeClasses.button.primary)}
                          >Download</a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {activeTab === 'result' && (
              <div className="space-y-4">
                <h2 className={combineTheme('text-lg font-medium', themeClasses.text.primary)}>Evaluation Result</h2>
                {evaluations.length === 0 ? (
                  <p className={combineTheme('text-sm italic', themeClasses.text.tertiary)}>No evaluations yet.</p>
                ) : (
                  <div className="space-y-6">
                    {evaluations.map(ev => (
                      <div key={ev.id} className="space-y-4">
                        <div className={combineTheme('border rounded-lg p-6', themeClasses.border.primary, 'bg-blue-50 dark:bg-blue-900/30')}>
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(12rem,0.8fr)_minmax(0,1.2fr)] md:items-center">
                            <div>
                              <p className={combineTheme('text-sm font-medium mb-2', themeClasses.text.tertiary)}>Total Score</p>
                              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                {ev.total_score !== null && ev.total_score !== undefined ? parseFloat(String(ev.total_score)).toFixed(2) : 'N/A'}
                              </p>
                            </div>
                            {ev.interpretation && (
                              <div>
                                <p className={combineTheme('text-sm font-medium mb-2', themeClasses.text.tertiary)}>Score Interpretation</p>
                                <p className={combineTheme('font-semibold text-xl', themeClasses.text.primary)}>
                                  {ev.interpretation.interpretation}
                                </p>
                                <p className={combineTheme('text-sm mt-2', themeClasses.text.secondary)}>
                                  {ev.interpretation.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className={combineTheme('text-sm font-medium mb-2', themeClasses.text.tertiary)}>Status</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            ev.status_name === 'approved' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200' :
                            ev.status_name === 'declined' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200' :
                            ev.status_name === 'revision' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200' :
                            'bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-200'
                          }`}>
                            {formatStatus(ev.status_name || '')}
                          </span>
                        </div>

                        {ev.remarks && (
                          <div className={combineTheme('border rounded-lg p-6', themeClasses.border.primary)}>
                            <p className={combineTheme('text-sm font-medium mb-3', themeClasses.text.tertiary)}>Remarks</p>
                            <div className={combineTheme('p-4 rounded-lg', 'bg-gray-50 dark:bg-slate-700/50')}>
                              <p className={combineTheme('whitespace-pre-wrap', themeClasses.text.primary)}>
                                {ev.remarks}
                              </p>
                            </div>
                          </div>
                        )}

                        {ev.evaluator && (
                          <div>
                            <p className={combineTheme('text-sm font-medium mb-1', themeClasses.text.tertiary)}>Evaluator</p>
                            <p className={themeClasses.text.primary}>{ev.evaluator}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {(project.status === 'for_revision' || project.status === 'revision' || project.status_id === 2) && (
            <div className={combineTheme('shadow-sm rounded-md p-6 space-y-4', themeClasses.card.base)}>
              <h2 className={combineTheme('text-lg font-medium', themeClasses.text.primary)}>Revision / Resubmission</h2>
              <p className={combineTheme('text-sm', themeClasses.text.secondary)}>
                Review the evaluator's remarks and make necessary changes to your project.
              </p>
              <div className="flex items-center space-x-3">
                <Link
                  href={route('proponent.pap.revise.show', project.id)}
                  className={combineTheme('inline-flex items-center px-4 py-2 rounded-md text-sm font-medium', themeClasses.button.primary)}
                >
                  Start Revision Process
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}