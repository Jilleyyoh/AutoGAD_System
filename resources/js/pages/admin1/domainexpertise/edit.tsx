import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';

interface Domain {
  id: number;
  domain_name: string;
  description?: string;
}

interface Props {
  domain: Domain;
}

export default function Edit({ domain }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    domain_name: domain.domain_name || '',
    description: domain.description || '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    put(route('domain.update', domain.id));
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Domain Expertise', href: route('domain.index') },
        { title: 'Edit', href: route('domain.edit', domain.id) },
      ]}
    >
      <Head title="Edit Domain Expertise" />
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Domain Expertise</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Edit domain expertise details.</p>
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
                  placeholder="Enter domain name"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter description"
                  rows={4}
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-[#5a189a] dark:bg-[#5a189a] text-white rounded-lg hover:bg-[#4a0e7a] dark:hover:bg-[#4a0e7a] transition disabled:opacity-50"
                >
                  {processing ? 'Updating...' : 'Update Domain Expertise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
