import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';

interface Props {
  // Add any props if needed
}

export default function Create({}: Props) {
  const { data, setData, post, processing, errors } = useForm({
    domain_name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('domain.store'));
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Domain Expertise', href: route('domain.index') },
        { title: 'Create', href: route('domain.create') },
      ]}
      sidebarOpen={true}
    >
      <Head title="Create Domain Expertise" />

      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Domain Expertise
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new domain expertise area for evaluators.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="domain_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Domain Name
                </label>
                <input
                  type="text"
                  id="domain_name"
                  value={data.domain_name}
                  onChange={(e) => setData('domain_name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  required
                />
                {errors.domain_name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.domain_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <a
                  href={route('domain.index')}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {processing ? 'Creating...' : 'Create Domain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
