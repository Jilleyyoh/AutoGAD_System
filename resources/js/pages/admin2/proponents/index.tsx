import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { Plus, Edit2, Trash2, Users, AlertCircle, Calendar, FileText } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Proponent {
  id: number;
  user_id: number;
  organization: string;
  position: string;
  contact_number: string;
  user: User;
  created_at: string;
  updated_at: string;
}

interface Props {
  proponents: Proponent[];
}

export default function Index({ proponents }: Props) {
  const { delete: destroy } = useForm({});
  const [proponentToDelete, setProponentToDelete] = useState<Proponent | null>(null);
  const [search, setSearch] = useState('');

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Safely check proponents before rendering
  const safeProponents = Array.isArray(proponents) ? proponents : [];

  // Filter proponents based on search
  const filteredProponents = safeProponents.filter(proponent =>
    proponent.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    proponent.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    proponent.organization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Proponents', href: route('admin2.proponents.index') },
      ]}
      sidebarOpen={false}
    >
      <Head title="Manage Proponents" />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage Proponents
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Recruit and manage proponents for project submissions
              </p>
            </div>
            <Link
              href={route('admin2.proponents.create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5a189a] hover:bg-[#4a0e7a] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 dark:bg-[#5a189a] dark:hover:bg-[#4a0e7a] whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Proponent
            </Link>
          </div>

          {/* Info Card */}
          <div className="mb-8 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">About Proponents</h3>
                <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                  Proponents are individuals or organizations that submit projects for evaluation across various domains.
                </p>
              </div>
            </div>
            
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Proponents
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Statistics */}
          {safeProponents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Total Proponents</p>
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{safeProponents.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Organizations Covered</p>
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {new Set(safeProponents.map(p => p.organization)).size}
                </p>
              </div>
            </div>
          )}

          {/* Proponents Table */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden">
            {safeProponents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Proponent Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider min-w-[300px]">
                        Organization
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProponents.map((proponent) => (
                      <tr key={proponent.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {proponent.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {proponent.user?.name || 'No Name'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {proponent.user?.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            {proponent.organization || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {proponent.position || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {proponent.contact_number || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(proponent.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Link
                              href={route('admin2.proponents.edit', proponent.id)}
                              className="inline-flex items-center px-3 py-2 border border-amber-300 dark:border-amber-600 text-sm font-medium rounded-md text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                              title="Edit Proponent"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setProponentToDelete(proponent)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                              title="Delete Proponent"
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
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">No proponents yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Start by adding your first proponent</p>
                <Link
                  href={route('admin2.proponents.create')}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Proponent
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!proponentToDelete}
        onClose={() => setProponentToDelete(null)}
        onConfirm={() => {
          if (proponentToDelete) {
            destroy(route('admin2.proponents.destroy', proponentToDelete.id), { method: 'delete' });
            setProponentToDelete(null);
          }
        }}
        title="Delete Proponent"
        description={`Are you sure you want to delete ${proponentToDelete?.user?.name} as a proponent? This action cannot be undone and may affect pending projects.`}
      />
    </AppLayout>
  );
}
