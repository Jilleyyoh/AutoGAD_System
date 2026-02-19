import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { themeClasses, combineTheme } from '@/lib/theme-classes';
import { Plus, Mail, Building2, FolderOpen, Badge } from 'lucide-react';

interface Project {
  id: number;
  title?: string; // fallback to project_title if transformed not applied
  project_title?: string;
  status?: string; // may come as project_status?.name
  project_status?: { name: string };
  created_at?: string;
}

interface Proponent {
  id: number;
  name: string;
  organization: string;
  email: string;
  total_paps: number;
}

interface Props {
  projects: Project[];
  proponent: Proponent;
}

export default function Dashboard({ projects, proponent }: Props) {
  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/proponent/dashboard' }
      ]}
    >
      <Head title="Proponent Dashboard" />

      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Proponent Profile Card */}
          <div className={combineTheme('overflow-hidden shadow-md sm:rounded-lg border', themeClasses.card.base)}>
            <div className={combineTheme('p-8 border-b flex items-start justify-between', themeClasses.border.primary)}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={combineTheme('w-6 h-6 p-1 rounded-full', themeClasses.badge.blue)} />
                  <span className={combineTheme('px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider', themeClasses.badge.purple)}>
                    Proponent
                  </span>
                </div>
                <h1 className={combineTheme('text-3xl font-bold', themeClasses.text.primary)}>
                  {proponent.name}
                </h1>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className={combineTheme('w-5 h-5', themeClasses.icon.muted)} />
                    <div>
                      <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Organization</p>
                      <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{proponent.organization}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className={combineTheme('w-5 h-5', themeClasses.icon.muted)} />
                    <div>
                      <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Email</p>
                      <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{proponent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FolderOpen className={combineTheme('w-5 h-5', themeClasses.icon.muted)} />
                    <div>
                      <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Total PAPs</p>
                      <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{proponent.total_paps}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Section */}
          <div className={combineTheme('mt-6 mb-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md p-6', themeClasses.card.base)}>
            <div className="p-6">
              <h2 className={combineTheme('text-2xl font-semibold', themeClasses.text.primary)}>Welcome to your Dashboard</h2>
              <p className={combineTheme('mt-2', themeClasses.text.secondary)}>
                Here you can manage your Programs, Activities, and Projects (PAPs) and track their status across the evaluation workflow.
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="mb-8">
            <Link
              href={route('proponent.pap.create')}
              className={combineTheme('inline-flex items-center gap-2 px-6 py-3 border border-transparent shadow-md text-sm font-medium rounded-lg transition-all', themeClasses.button.primary)}
              style={{ backgroundColor: '#5a189a' }}
            >
              <Plus className="w-5 h-5" />
              Submit New PAP
            </Link>
          </div>

          {/* Recent PAPs Section */}
          <div className={combineTheme('shadow-md rounded-lg overflow-hidden border mb-8', themeClasses.card.base)}>
            <div className="px-6 py-5 sm:px-8">
              <h2 className={combineTheme('text-lg font-semibold', themeClasses.text.primary)}>Your PAPs</h2>
              <p className={combineTheme('mt-1 text-sm', themeClasses.text.secondary)}>
                List of your submitted Programs, Activities, and Projects (PAPs)
              </p>
            </div>
            <div className={combineTheme('border-t', themeClasses.border.primary)}>
              <table className="min-w-full divide-y" style={{ borderBottomColor: 'var(--border-color)' }}>
                <thead className={themeClasses.table.header}>
                  <tr>
                    <th scope="col" className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.secondary)}>
                      Title
                    </th>
                    <th scope="col" className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.secondary)}>
                      Status
                    </th>
                    <th scope="col" className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.secondary)}>
                      Submitted
                    </th>
                    <th scope="col" className={combineTheme('px-6 py-3 text-center text-xs font-medium uppercase tracking-wider', themeClasses.text.secondary)}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={combineTheme('divide-y', themeClasses.table.border)}>
                  {projects.map((project) => {
                    const statusRaw = project.status || project.project_status?.name || 'pending';
                    // Humanize status keys (e.g. "for_evaluation" -> "For Evaluation")
                    const statusLabel = String(statusRaw).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                    const title = project.title || project.project_title || 'Untitled';
                    const created = project.created_at ? new Date(project.created_at).toLocaleDateString() : '—';
                    return (
                    <tr key={project.id} className={themeClasses.table.row}>
                      <td className={combineTheme('px-6 py-4 text-sm font-medium', themeClasses.text.primary)}>
                        <span title={title} className="truncate block max-w-xs">{title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusRaw === 'for_evaluation' ? combineTheme('', themeClasses.status.for_evaluation) :
                          statusRaw === 'revision' ? combineTheme('', themeClasses.status.revision) :
                          statusRaw === 'approved' ? combineTheme('', themeClasses.status.approved) :
                          statusRaw === 'declined' ? combineTheme('', themeClasses.status.declined) :
                          statusRaw === 'review' ? combineTheme('', themeClasses.status.review) :
                          statusRaw === 'for_certification' ? combineTheme('', themeClasses.status.for_certification) :
                          statusRaw === 'certified' ? combineTheme('', themeClasses.status.certified) :
                          combineTheme('', themeClasses.status.unknown)
                        }`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className={combineTheme('px-6 py-4 text-sm whitespace-nowrap', themeClasses.text.secondary)}>
                        {created}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={route('proponent.pap.show', project.id)}
                          className={combineTheme('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all', themeClasses.button.secondary)}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )})}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={4} className={combineTheme('px-6 py-8 text-center', themeClasses.text.secondary)}>
                        <div className="flex flex-col items-center gap-2">
                          <FolderOpen className={combineTheme('w-8 h-8', themeClasses.icon.muted)} />
                          <p className={combineTheme('font-medium', themeClasses.text.primary)}>No PAPs submitted yet</p>
                          <p className="text-xs">Click "Submit New PAP" to get started.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}