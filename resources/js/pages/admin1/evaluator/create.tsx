import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { NativeSelect } from '@/components/ui/native-select';

interface DomainExpertise {
  id: number;
  domain_name: string;
  description?: string;
}

interface Props {
  domains: DomainExpertise[];
  evaluatorRoleId: number;
}

export default function Create({ domains, evaluatorRoleId }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    birthdate: '',
    domain_expertise_id: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(route('evaluators.store'));
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Evaluators', href: route('evaluators.index') },
        { title: 'Create', href: route('evaluators.create') },
      ]}
      sidebarOpen={true}
    >
      <Head title="Create Evaluator" />

      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Evaluator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new evaluator to the system.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter full name"
                  required
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter email address"
                  required
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="birthdate"
                  value={data.birthdate}
                  onChange={(e) => setData('birthdate', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  required
                />
                {errors.birthdate && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.birthdate}</p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-slate-800 p-3 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  ℹ️ Password will be automatically set to the registered date (MM-DD-YYYY format) upon account creation.
                </p>
              </div>

              <div>
                <label htmlFor="domain_expertise_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Domain Expertise
                </label>
                <NativeSelect
                  id="domain_expertise_id"
                  value={data.domain_expertise_id}
                  onChange={(e) => setData('domain_expertise_id', e.target.value)}
                  className="mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  required
                >
                  <option value="">Select a domain</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.domain_name}
                    </option>
                  ))}
                </NativeSelect>
                {errors.domain_expertise_id && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.domain_expertise_id}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <a
                  href={route('evaluators.index')}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {processing ? 'Creating...' : 'Create Evaluator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
