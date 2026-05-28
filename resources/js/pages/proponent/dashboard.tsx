import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { themeClasses, combineTheme } from '@/lib/theme-classes';
import { Plus, ArrowRight, FilePlus2, ListOrdered, Award, MessageSquare } from 'lucide-react';

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

const accessItems = [
  {
    title: 'Submit PAP',
    description: 'Create and submit a new Program, Activity, or Project',
    icon: FilePlus2,
    href: '/proponent/pap/create',
    color: 'blue',
    accent: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Track Submissions',
    description: 'Monitor evaluation status for submitted PAPs',
    icon: ListOrdered,
    href: '/proponent/pap/submissions',
    color: 'emerald',
    accent: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'Certificates',
    description: 'View certified projects and download certificates',
    icon: Award,
    href: '/proponent/certificates',
    color: 'purple',
    accent: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Messages',
    description: 'Read and respond to messages from admins',
    icon: MessageSquare,
    href: '/proponent/conversations',
    color: 'orange',
    accent: 'from-orange-500 to-orange-600',
  },
];

export default function Dashboard({ projects, proponent }: Props) {
  const recentCount = projects.length;
  const certifiedCount = projects.filter((project) => String(project.status || project.project_status?.name || '').toLowerCase() === 'certified').length;
  const activeCount = projects.filter((project) => {
    const status = String(project.status || project.project_status?.name || '').toLowerCase();
    return status && status !== 'certified' && status !== 'declined' && status !== 'rejected';
  }).length;

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/proponent/dashboard' }
      ]}
    >
      <Head title="Proponent Dashboard" />

      <div className={combineTheme('min-h-screen', themeClasses.bg.tertiary)}>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className={combineTheme('text-3xl font-bold', themeClasses.text.primary)}>Dashboard</h2>
              <p className={combineTheme('mt-2 max-w-3xl', themeClasses.text.secondary)}>
                Manage your Programs, Activities, and Projects and track each submission through evaluation and certification.
              </p>
            </div>
            <div>
              <Link
                href={route('proponent.pap.create')}
                className={combineTheme('inline-flex items-center gap-2 px-6 py-3 border text-sm font-medium transition-all', themeClasses.button.primary)}
              >
                <Plus className="w-5 h-5" />
                Submit New PAP
              </Link>
            </div>
          </div>

          {/* Proponent Profile Card */}
          <div className={combineTheme('overflow-hidden border mb-8', themeClasses.card.base)}>
            <div className={combineTheme('p-8 border-b flex items-start justify-between', themeClasses.border.primary)}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={combineTheme('px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider', themeClasses.badge.purple)}>
                    Proponent
                  </span>
                </div>
                <h1 className={combineTheme('text-3xl font-bold', themeClasses.text.primary)}>
                  {proponent.name}
                </h1>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Organization</p>
                    <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{proponent.organization}</p>
                  </div>
                  <div>
                    <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Email</p>
                    <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{proponent.email}</p>
                  </div>
                  <div>
                    <p className={combineTheme('text-xs font-medium uppercase tracking-wider', themeClasses.text.tertiary)}>Total PAPs</p>
                    <p className={combineTheme('text-sm font-semibold', themeClasses.text.primary)}>{proponent.total_paps}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total PAPs', value: proponent.total_paps },
              { label: 'Active Submissions', value: activeCount },
              { label: 'Certified Projects', value: certifiedCount },
            ].map((item) => (
              <div key={item.label} className={combineTheme('border p-6', themeClasses.card.base)}>
                <p className={combineTheme('text-sm font-semibold uppercase tracking-wide', themeClasses.text.tertiary)}>{item.label}</p>
                <p className={combineTheme('mt-3 text-4xl font-bold', themeClasses.text.primary)}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {accessItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group relative overflow-hidden bg-white dark:bg-gray-900 transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  <div className="relative p-6 flex flex-col h-full">
                    <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300 ${
                      item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                      item.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                      {item.description}
                    </p>
                    <div className="flex items-center text-[#5a189a] dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                      Access <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>

                  <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${item.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
