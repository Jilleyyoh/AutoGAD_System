import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';

interface Document {
  id: number;
  type?: string;
  description?: string | null;
  file_path?: string | null; // Public URL (may be null)
  file_name?: string | null;
  download_route?: string; // Backend route for secure download
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
}

interface Props {
  project: Project;
}

export default function Show({ project }: Props) {
  if (!project) {
    return <div className="p-6 text-red-600">Project data unavailable.</div>;
  }

  const status = project.status || 'pending';
  const createdAt = project.created_at ? new Date(project.created_at) : null;
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/proponent/dashboard' },
        { title: 'PAP Details', href: route('proponent.pap.show', project.id) },
      ]}
    >
  <Head title={`PAP: ${project.title || 'Project'}`} />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Status Banner */}
          <div className={`px-4 py-3 border-b ${
            status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
            status === 'approved' ? 'bg-green-50 border-green-200' :
            status === 'rejected' ? 'bg-red-50 border-red-200' :
            status === 'for_revision' || status === 'revision' ? 'bg-orange-50 border-orange-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'approved' ? 'bg-green-100 text-green-800' :
                  status === 'rejected' ? 'bg-red-100 text-red-800' :
                  status === 'for_revision' || status === 'revision' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-600">
                  Submitted on {formatDate(createdAt)}
                </span>
                {(status === 'for_revision' || status === 'revision') && (
                  <Link
                    href={route('proponent.pap.revise.show', project.id)}
                    className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700"
                  >
                    Revise Project
                  </Link>
                )}
              </div>
              <Link
                href={route('proponent.dashboard')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Project Information */}
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Project Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.title || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Domain</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.domain_expertise?.domain_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phase</dt>
                <dd className="mt-1 text-sm text-gray-900">{project.phase || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{project.description || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Documents */}
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Project Documents</h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="divide-y divide-gray-200">
              {(project.documents || []).map((document) => (
                <div key={document.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{document.type || 'Document'}</h4>
                      {document.description && <p className="mt-1 text-sm text-gray-500">{document.description}</p>}
                    </div>
                    {(document.download_route || document.file_path) && (
                      <a
                        href={document.download_route || document.file_path || '#'}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}