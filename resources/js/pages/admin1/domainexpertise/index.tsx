import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface Domain {
  id: number;
  domain_name: string;
  description?: string;
}

interface Props {
  domains: Domain[];
}

export default function Index({ domains }: Props) {
  const { delete: destroy } = useForm({});
  const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);
  const [search, setSearch] = useState('');

  // Filter domains based on search input
  const filteredDomains = domains.filter((domain) =>
    domain.domain_name.toLowerCase().includes(search.toLowerCase()) ||
    (domain.description && domain.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Domain Expertise', href: route('domain.index') }
      ]}
    >
      <Head title="Domain Expertise" />
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage Domain Expertise
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Create and manage evaluation domains for your GAD initiatives
              </p>
            </div>
            <Link
              href={route('domain.create')}
              style={{ backgroundColor: '#5a189a' }}
              className="inline-flex items-center gap-2 px-6 py-3 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 dark:bg-blue-700 dark:hover:bg-blue-800 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Domain
            </Link>
          </div>

          {/* Info Card */}
          <div className="mb-8 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-900/10 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">About Domains</h3>
                <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                  Domains represent the evaluation criteria and areas of focus for GAD projects. Each domain helps structure the evaluation framework.
                </p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Domains
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by domain name or description..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Constrained content: table + stats */}
          {/* Domains Table */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden">
            {filteredDomains.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Domain Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDomains.map((domain) => (
                      <tr key={domain.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {domain.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {domain.domain_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="max-w-xs truncate" title={domain.description || 'No description'}>
                            {domain.description || <span className="text-gray-400 dark:text-gray-500 italic">No description</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Link
                              href={route('domain.edit', domain.id)}
                              className="inline-flex items-center px-3 py-2 border border-amber-300 dark:border-amber-600 text-sm font-medium rounded-md text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                              title="Edit Domain"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDomainToDelete(domain)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                              title="Delete Domain"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">No domains yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Create your first domain to get started</p>
                <Link
                  href={route('domain.create')}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Domain
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!domainToDelete}
        onClose={() => setDomainToDelete(null)}
        onConfirm={() => {
          if (domainToDelete) {
            destroy(route('domain.destroy', domainToDelete.id), { method: 'delete' });
            setDomainToDelete(null);
          }
        }}
        title="Delete Domain"
        description={`Are you sure you want to delete the domain "${domainToDelete?.domain_name}"? This action cannot be undone and may affect existing evaluations.`}
      />
    </AppLayout>
  );
}
