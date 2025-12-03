import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { themeClasses, combineTheme } from '@/lib/theme-classes';
import { Clock, Eye, CheckCircle2, XCircle, Calendar, X, Plus, ArrowRight } from 'lucide-react';

interface ProjectRow {
  id: number;
  project_code: string;
  title: string;
  domain?: string;
  status: string;
  created_at: string;
}

interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
}

interface ExtraProps {
  projects: Pagination<ProjectRow>;
  filters: { status?: string; from?: string; to?: string };
  statusOptions: string[];
  highlightProjectId?: number;
}

export default function SubmissionsIndex() {
  // Use any merge to satisfy inertia generic constraint while keeping strong local typing
  const { projects, filters, statusOptions, highlightProjectId } = usePage<any>().props as ExtraProps;
  const [activeTab, setActiveTab] = useState<string>(filters.status || 'all');
  const [local, setLocal] = useState(filters);
  const [search, setSearch] = useState('');

  // Scroll and highlight effect
  useEffect(() => {
    if (highlightProjectId) {
      const element = document.querySelector(`tr[data-project-id="${highlightProjectId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightProjectId]);

  // Status mapping for display
  const STATUS_MAP: { [key: string]: string } = {
    'for_evaluation': 'for_evaluation',
    'revision': 'revision',
    'approved': 'approved',
    'declined': 'declined',
    'review': 'review',
    'for_certification': 'for_certification',
    'certified': 'certified',
  };

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'for_evaluation', label: 'For Evaluation' },
    { key: 'revision', label: 'Revision' },
    { key: 'approved', label: 'Approved' },
    { key: 'declined', label: 'Declined' },
    { key: 'review', label: 'In Review' },
    { key: 'for_certification', label: 'For Certification' },
    { key: 'certified', label: 'Certified' },
  ];

  // Calculate status counts from filtered data
  const allProjects = projects.data;
  const statusCount = {
    all: allProjects.length,
    for_evaluation: allProjects.filter(p => p.status === 'for_evaluation').length,
    revision: allProjects.filter(p => p.status === 'revision').length,
    approved: allProjects.filter(p => p.status === 'approved').length,
    declined: allProjects.filter(p => p.status === 'declined').length,
    review: allProjects.filter(p => p.status === 'review').length,
    for_certification: allProjects.filter(p => p.status === 'for_certification').length,
    certified: allProjects.filter(p => p.status === 'certified').length,
  };

  const getStatusColorAndIcon = (statusKey: string) => {
    switch (statusKey) {
      case 'for_evaluation':
        return { color: 'blue', icon: Clock, bg: 'bg-blue-50 dark:bg-blue-900/10', border: 'border-blue-200 dark:border-blue-800' };
      case 'revision':
        return { color: 'yellow', icon: Eye, bg: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800' };
      case 'approved':
        return { color: 'green', icon: CheckCircle2, bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800' };
      case 'declined':
        return { color: 'red', icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800' };
      case 'review':
        return { color: 'orange', icon: Eye, bg: 'bg-orange-50 dark:bg-orange-900/10', border: 'border-orange-200 dark:border-orange-800' };
      case 'for_certification':
        return { color: 'indigo', icon: Clock, bg: 'bg-indigo-50 dark:bg-indigo-900/10', border: 'border-indigo-200 dark:border-indigo-800' };
      case 'certified':
        return { color: 'purple', icon: CheckCircle2, bg: 'bg-purple-50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-800' };
      default:
        return { color: 'gray', icon: Eye, bg: 'bg-gray-50 dark:bg-gray-900/10', border: 'border-gray-200 dark:border-gray-800' };
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (activeTab !== 'all') params.set('status', activeTab);
    if (local.from) params.set('from', local.from);
    if (local.to) params.set('to', local.to);
    window.location.href = route('proponent.pap.submissions') + (params.toString() ? '?' + params.toString() : '');
  };

  const filteredProjects = activeTab === 'all'
    ? projects.data
    : projects.data.filter(p => p.status === activeTab);

  // Apply search filter
  const finalFilteredProjects = search.trim()
    ? filteredProjects.filter(project =>
        project.project_code.toLowerCase().includes(search.toLowerCase()) ||
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        (project.domain || '').toLowerCase().includes(search.toLowerCase())
      )
    : filteredProjects;

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('proponent.dashboard') }, { title: 'Track Submissions', href: route('proponent.pap.submissions') }]}>
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className={combineTheme('text-3xl font-bold', themeClasses.text.primary)}>
              Track Submissions
            </h1>
            <p className={combineTheme('mt-2 max-w-2xl', themeClasses.text.secondary)}>
              View and manage your project submissions across different stages
            </p>
          </div>

          {/* Status Filter Tabs - CENTERED */}
          <div className="mb-8">
            <div className={combineTheme('rounded-lg border shadow-sm', themeClasses.card.base)}>
              <div className="flex flex-wrap justify-center gap-1 p-2 lg:gap-2 lg:p-3">
                {statusTabs.map((tab) => {
                  const { color, icon: TabIcon, bg, border } = getStatusColorAndIcon(tab.key);
                  const count = statusCount[tab.key as keyof typeof statusCount];
                  const isActive = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md font-medium text-xs transition-all duration-200 ${
                        isActive
                          ? `${bg} ${border} border-2 text-${color}-700 dark:text-${color}-300 shadow-md`
                          : combineTheme('text-gray-600 hover:text-gray-900 border border-transparent', themeClasses.text.secondary, 'dark:hover:text-gray-300')
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                        isActive
                          ? `${color === 'blue' ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200' : 
                             color === 'green' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' :
                             color === 'yellow' ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200' :
                             color === 'purple' ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200' :
                             color === 'orange' ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200' :
                             'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'}`
                          : combineTheme('bg-gray-100 text-gray-600', 'dark:bg-slate-700 dark:text-gray-400')
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className={combineTheme('p-6 shadow-sm rounded-lg border mb-6', themeClasses.card.base)}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className={combineTheme('w-5 h-5', themeClasses.icon.primary)} />
                <h2 className={combineTheme('text-lg font-semibold', themeClasses.text.primary)}>Refine by Date (Optional)</h2>
              </div>
              {(local.from || local.to) && (
                <button
                  onClick={() => {
                    setLocal({ ...local, from: undefined, to: undefined });
                    const params = new URLSearchParams();
                    if (activeTab !== 'all') params.set('status', activeTab);
                    window.location.href = route('proponent.pap.submissions') + (params.toString() ? '?' + params.toString() : '');
                  }}
                  className={combineTheme('text-sm px-3 py-1 rounded-md', themeClasses.button.secondary)}
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Clear Dates
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* From Date */}
              <div>
                <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={local.from || ''}
                    onChange={e => setLocal({ ...local, from: e.target.value || undefined })}
                    className={combineTheme('block w-full px-4 py-2 rounded-lg border text-sm appearance-none cursor-pointer', themeClasses.input.base, themeClasses.input.focus)}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cpath d='M16 2v4M8 2v4M3 10h18'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.25rem',
                      paddingRight: '2.5rem',
                    }}
                  />
                </div>
                {local.from && (
                  <p className={combineTheme('text-xs mt-1', themeClasses.text.tertiary)}>
                    {new Date(local.from).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* To Date */}
              <div>
                <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={local.to || ''}
                    onChange={e => setLocal({ ...local, to: e.target.value || undefined })}
                    className={combineTheme('block w-full px-4 py-2 rounded-lg border text-sm appearance-none cursor-pointer', themeClasses.input.base, themeClasses.input.focus)}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect x='3' y='4' width='18' height='18' rx='2'/%3E%3Cpath d='M16 2v4M8 2v4M3 10h18'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                      backgroundSize: '1.25rem',
                      paddingRight: '2.5rem',
                    }}
                  />
                </div>
                {local.to && (
                  <p className={combineTheme('text-xs mt-1', themeClasses.text.tertiary)}>
                    {new Date(local.to).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="md:col-span-1 lg:col-span-1 flex items-end">
                {local.from && local.to ? (
                  <div className={combineTheme('w-full px-4 py-2 rounded-lg text-sm font-medium text-center', themeClasses.badge.blue)}>
                    {Math.ceil((new Date(local.to).getTime() - new Date(local.from).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                  </div>
                ) : local.from || local.to ? (
                  <div className={combineTheme('w-full px-4 py-2 rounded-lg text-sm font-medium text-center', themeClasses.badge.yellow)}>
                    Select both dates
                  </div>
                ) : (
                  <div className={combineTheme('w-full px-4 py-2 rounded-lg text-sm text-center', themeClasses.text.tertiary)}>
                    Date range optional
                  </div>
                )}
              </div>

              {/* Apply Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={applyFilters}
                  className={combineTheme('w-full px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-all', themeClasses.button.primary)}
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Date Range Info */}
            {(local.from || local.to) && (
              <div className={combineTheme('mt-4 px-4 py-3 rounded-md text-sm', themeClasses.alert.info)}>
                <span className={combineTheme('font-medium', themeClasses.text.primary)}>Filtering by: </span>
                <span className={themeClasses.text.secondary}>
                  {local.from && `from ${new Date(local.from).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                  {local.from && local.to && ' to '}
                  {local.to && `${new Date(local.to).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                </span>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Submissions
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project code, title, or domain..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className={combineTheme('shadow-md rounded-lg overflow-hidden border', themeClasses.card.base)}>
            <div className={combineTheme('px-6 py-5 border-b flex items-center justify-between', themeClasses.border.primary)}>
              <div>
                <h2 className={combineTheme('text-lg font-semibold', themeClasses.text.primary)}>Your Submissions</h2>
                <p className={combineTheme('text-sm mt-1', themeClasses.text.tertiary)}>Total: {finalFilteredProjects.length} of {projects.total} submissions</p>
              </div>
              <Link 
                href={route('proponent.pap.create')} 
                className={combineTheme('inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all', themeClasses.button.primary)}
              >
                <Plus className="w-4 h-4" />
                Create New PAP
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className={combineTheme('min-w-full divide-y', themeClasses.table.border)}>
                <thead className={themeClasses.table.header}>
                  <tr>
                    <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.secondary)}>Code</th>
                    <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.secondary)}>Title</th>
                    <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.secondary)}>Domain</th>
                    <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.secondary)}>Submitted</th>
                    <th className={combineTheme('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider', themeClasses.text.secondary)}>Status</th>
                    <th className={combineTheme('px-6 py-3 text-center text-xs font-medium uppercase tracking-wider', themeClasses.text.secondary)}>Action</th>
                  </tr>
                </thead>
                <tbody className={combineTheme('divide-y', themeClasses.table.border)}>
                  {finalFilteredProjects.map(p => {
                    const { color, icon: StatusIcon, bg, border } = getStatusColorAndIcon(p.status);
                    const isHighlighted = highlightProjectId && p.id === highlightProjectId;
                    return (
                      <tr 
                        key={p.id} 
                        data-project-id={p.id}
                        className={combineTheme('transition-colors', 
                          isHighlighted 
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 shadow-md' 
                            : themeClasses.table.row
                        )}
                      >
                        <td className={combineTheme('px-6 py-4 text-sm font-mono font-semibold', themeClasses.text.primary)}>{p.project_code}</td>
                        <td className={combineTheme('px-6 py-4 text-sm max-w-xs', themeClasses.text.primary)}>
                          <span title={p.title} className="truncate">{p.title}</span>
                        </td>
                        <td className={combineTheme('px-6 py-4 text-sm', themeClasses.text.secondary)}>{p.domain || '—'}</td>
                        <td className={combineTheme('px-6 py-4 text-sm whitespace-nowrap', themeClasses.text.secondary)}>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={combineTheme('inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold', bg, border, 'border')}>
                            <StatusIcon className="w-3 h-3" />
                            {p.status.split('_').map((word, idx) => 
                              idx === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {p.status === 'revision' ? (
                            <Link 
                              href={route('proponent.pap.submissions.show', p.id)} 
                              className={combineTheme('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all', themeClasses.button.primary)}
                            >
                              <Eye className="w-4 h-4" />
                              Revise
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          ) : (
                            <Link 
                              href={route('proponent.pap.submissions.show', p.id)} 
                              className={combineTheme('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all', themeClasses.button.secondary)}
                            >
                              <Eye className="w-4 h-4" />
                              View
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {finalFilteredProjects.length === 0 && (
                    <tr>
                      <td colSpan={6} className={combineTheme('px-6 py-12 text-center', themeClasses.text.secondary)}>
                        <div className="flex flex-col items-center gap-2">
                          <Clock className={combineTheme('w-8 h-8', themeClasses.icon.muted)} />
                          <p className="font-medium">No submissions found</p>
                          <p className="text-xs">Try adjusting your filters or create a new PAP</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className={combineTheme('px-6 py-4 border-t flex items-center justify-between', themeClasses.border.primary)}>
              <div className={combineTheme('text-sm', themeClasses.text.secondary)}>
                Page <span className={combineTheme('font-semibold', themeClasses.text.primary)}>{projects.current_page}</span> of <span className={combineTheme('font-semibold', themeClasses.text.primary)}>{projects.last_page}</span> 
                <span className={combineTheme('ml-2', themeClasses.text.tertiary)}>({projects.total} total)</span>
              </div>
              <div className="flex items-center gap-2">
                {projects.links.filter(l => l.label !== '&laquo; Previous' && l.label !== 'Next &raquo;').map((l,i) => (
                  <button
                    key={i}
                    disabled={!l.url}
                    onClick={() => l.url && (window.location.href = l.url)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      l.active 
                        ? combineTheme('text-white shadow-md', 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800') 
                        : combineTheme('border', themeClasses.button.secondary)
                    } ${!l.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
