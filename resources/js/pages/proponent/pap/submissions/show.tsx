import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';
import { route } from 'ziggy-js';
import { themeClasses, combineTheme } from '@/lib/theme-classes';
import { ClipboardList, FileText, Eye } from 'lucide-react';

interface DocumentItem {
  id: number;
  original_name: string;
  type?: string;
  download_route: string;
}

interface EvaluationItem {
  id: number;
  total_score?: number;
  remarks?: string;
  status_name?: string;
  interpretation?: {
    interpretation: string;
    description: string;
  };
  evaluator?: string;
  created_at: string;
}

interface ProjectDetail {
  id: number;
  project_code: string;
  title: string;
  domain?: string;
  implementation_phase?: string;
  status: string;
  status_id?: number;
  description?: string;
  rationale?: string;
  objectives?: string;
  created_at: string;
  documents: DocumentItem[];
  evaluations: EvaluationItem[];
  certificate?: {
    id: number;
    certificate_number: string;
    certificate_code: string;
    issued_date: string;
    issued_by: string;
    download_route: string;
  };
}

interface ExtraProps {
  project: ProjectDetail;
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

export default function SubmissionShow() {
  const { project } = usePage<any>().props as ExtraProps;
  const domains = usePage<any>().props.domains ?? [];
  const phases = usePage<any>().props.phases ?? [];
  const [activeTab, setActiveTab] = useState('info');
  
  React.useEffect(() => {
    console.log('Project data:', {
      status: project.status,
      status_id: project.status_id,
      has_certificate: !!project.certificate,
      certificate: project.certificate
    });
  }, [project]);

  const statusLabel = project.status.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase());

  return (
    <AppLayout breadcrumbs={[
      { title: 'Dashboard', href: route('proponent.dashboard') },
      { title: 'Track Submissions', href: route('proponent.pap.submissions') },
      { title: project.project_code, href: route('proponent.pap.submissions.show', project.id) }
    ]}>
      <Head title={`Submission ${project.project_code}`} />
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className={combineTheme('text-2xl font-semibold', themeClasses.text.primary)}>{project.project_code}</h1>
            <p className={combineTheme('mt-1 text-sm', themeClasses.text.secondary)}>Submitted {new Date(project.created_at).toLocaleString()}</p>
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

          {/* Tab Content */}
          {/* Project Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <h2 className={combineTheme('text-lg font-medium', themeClasses.text.primary)}>Project Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className={combineTheme('', themeClasses.text.secondary)}>Title</div>
                  <div className={combineTheme('font-medium', themeClasses.text.primary)}>{project.title}</div>
                </div>
                <div>
                  <div className={combineTheme('', themeClasses.text.secondary)}>Domain</div>
                  <div className={combineTheme('font-medium', themeClasses.text.primary)}>{project.domain || '—'}</div>
                </div>
                <div>
                  <div className={combineTheme('', themeClasses.text.secondary)}>Implementation Phase</div>
                  <div className={combineTheme('font-medium', themeClasses.text.primary)}>{project.implementation_phase || '—'}</div>
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

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h2 className={combineTheme('text-lg font-medium', themeClasses.text.primary)}>Documents</h2>
              {project.documents.length === 0 && (
                <p className={combineTheme('text-sm', themeClasses.text.secondary)}>No documents uploaded.</p>
              )}
              <ul className={combineTheme('divide-y', themeClasses.table.border)}>
                {project.documents.map(doc => (
                  <li key={doc.id} className={combineTheme('py-3 flex items-center justify-between text-sm', themeClasses.table.row)}>
                    <div>
                      <div className={combineTheme('font-medium', themeClasses.text.primary)}>{doc.original_name}</div>
                      {doc.type && <div className={combineTheme('text-xs mt-0.5', themeClasses.text.tertiary)}>{doc.type}</div>}
                    </div>
                    <a
                      href={doc.download_route}
                      className={combineTheme('inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm', themeClasses.button.primary)}
                    >Download</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Evaluation Result Tab */}
          {activeTab === 'result' && (
            <div className="space-y-4">
              <h2 className={combineTheme('text-lg font-medium', themeClasses.text.primary)}>Evaluation Result</h2>
              {project.evaluations.length === 0 ? (
                <p className={combineTheme('text-sm italic', themeClasses.text.tertiary)}>No evaluations yet.</p>
              ) : (
                <div className="space-y-6">
                  {project.evaluations.map(ev => (
                    <div key={ev.id} className="space-y-4">
                      {/* Score Section */}
                      <div className={combineTheme('border rounded-lg p-6', themeClasses.border.primary, 'bg-blue-50 dark:bg-blue-900/30')}>
                        <p className={combineTheme('text-sm font-medium mb-2', themeClasses.text.tertiary)}>Total Score</p>
                        <div className="flex items-baseline gap-4">
                          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                            {ev.total_score !== null && ev.total_score !== undefined ? parseFloat(String(ev.total_score)).toFixed(2) : 'N/A'}
                          </p>
                          {ev.interpretation && (
                            <div>
                              <p className={combineTheme('font-semibold text-lg', themeClasses.text.primary)}>
                                {ev.interpretation.interpretation}
                              </p>
                              <p className={combineTheme('text-sm mt-1', themeClasses.text.secondary)}>
                                {ev.interpretation.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        <p className={combineTheme('text-sm font-medium mb-2', themeClasses.text.tertiary)}>Status</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          ev.status_name === 'approved' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200' :
                          ev.status_name === 'declined' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200' :
                          ev.status_name === 'revision' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200' :
                          'bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-200'
                        }`}>
                          {ev.status_name?.charAt(0).toUpperCase() + ev.status_name?.slice(1)}
                        </span>
                      </div>

                      {/* Remarks */}
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

                      {/* Evaluator Info */}
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

        {/* Revision controls */}
        {(project.status === 'revision' || project.status_id === 2) && (
          <div className={combineTheme('shadow-sm rounded-md p-6 space-y-4', themeClasses.card.base)}>
            <h2 className={combineTheme('text-lg font-medium', themeClasses.text.primary)}>Revision / Resubmission</h2>
            <p className={combineTheme('text-sm', themeClasses.text.secondary)}>Review the evaluator's remarks and make necessary changes to your project.</p>
            
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

        <div>
          <Link
            href={route('proponent.pap.submissions')}
            className={combineTheme('inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md', themeClasses.button.secondary)}
          >Back to Submissions</Link>
        </div>
      </div>
    </AppLayout>
  );
}
