import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { Plus, Edit2, Trash2, Users, AlertCircle, Calendar } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface DomainExpertise {
  id: number;
  domain_name: string;
  description?: string;
}

interface Evaluator {
  id: number;
  user_id: number;
  domain_expertise_id: number;
  user: User;
  domainExpertise: DomainExpertise;
  created_at: string;
  updated_at: string;
}

interface Props {
  evaluators: Evaluator[];
}

export default function Index({ evaluators }: Props) {
  const { delete: destroy } = useForm({});
  const [evaluatorToDelete, setEvaluatorToDelete] = useState<Evaluator | null>(null);
  const [search, setSearch] = useState('');

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Safely check evaluators before rendering
  const safeEvaluators = Array.isArray(evaluators) ? evaluators : [];

  // Get domain by ID (for display purposes)
  const getDomainName = (evaluator: Evaluator) => {
    return evaluator.domainExpertise?.domain_name || 'No Domain';
  };

  // Filter evaluators based on search input
  const filteredEvaluators = safeEvaluators.filter((evaluator) =>
    evaluator.user.name.toLowerCase().includes(search.toLowerCase()) ||
    evaluator.user.email.toLowerCase().includes(search.toLowerCase()) ||
    evaluator.domainExpertise.domain_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Evaluators', href: route('evaluators.index') }
      ]}
      sidebarOpen={false}
    >
      <Head title="Manage Evaluators" />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage Evaluators
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Recruit and manage evaluators across your domains
              </p>
            </div>
            <Link
              href={route('evaluators.create')}
              style={{ backgroundColor: '#5a189a' }}
              className="inline-flex items-center gap-2 px-6 py-3 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 dark:bg-emerald-700 dark:hover:bg-emerald-800 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Evaluator
            </Link>
          </div>

          {/* Info Card - Moved Below Search Bar */}
          <div className="mb-8 bg-gradient-to-br from-purple-50 to-purple-50 dark:from-purple-900/10 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">About Evaluators</h3>
                <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                  Evaluators are assigned to specific domains and will conduct evaluations of projects submitted under those domains.
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar - New Position */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Evaluators
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search evaluators by name, email, or domain..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>


          {/* Evaluators Table */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-md overflow-hidden">
            {filteredEvaluators.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Evaluator Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Domain
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
                    {filteredEvaluators.map((evaluator) => (
                      <tr key={evaluator.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {evaluator.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {evaluator.user?.name || 'No Name'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {evaluator.user?.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            {getDomainName(evaluator)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(evaluator.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Link
                              href={route('evaluators.edit', evaluator.id)}
                              className="inline-flex items-center px-3 py-2 border border-amber-300 dark:border-amber-600 text-sm font-medium rounded-md text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                              title="Edit Evaluator"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setEvaluatorToDelete(evaluator)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-600 text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                              title="Delete Evaluator"
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
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">No evaluators yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Start by adding your first evaluator</p>
                <Link
                  href={route('evaluators.create')}
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Evaluator
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!evaluatorToDelete}
        onClose={() => setEvaluatorToDelete(null)}
        onConfirm={() => {
          if (evaluatorToDelete) {
            destroy(route('evaluators.destroy', evaluatorToDelete.id), { method: 'delete' });
            setEvaluatorToDelete(null);
          }
        }}
        title="Delete Evaluator"
        description={`Are you sure you want to delete ${evaluatorToDelete?.user?.name} as an evaluator? This action cannot be undone and may affect pending evaluations.`}
      />
    </AppLayout>
  );
}