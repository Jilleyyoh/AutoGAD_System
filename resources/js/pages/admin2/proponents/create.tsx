import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';

interface Props {
  proponentRoleId: number;
}

export default function Create({ proponentRoleId }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    organization: '',
    position: '',
    contact_number: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(route('admin2.proponents.store'));
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: route('admin2.dashboard') },
        { title: 'Proponents', href: route('admin2.proponents.index') },
        { title: 'Create', href: route('admin2.proponents.create') },
      ]}
      sidebarOpen={false}
    >
      <Head title="Add New Proponent" />

      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Add New Proponent
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create a new proponent account for project submissions.
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter password"
                  required
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Confirm password"
                  required
                />
                {errors.password_confirmation && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>
                )}
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Organization
                </label>
                <input
                  type="text"
                  id="organization"
                  value={data.organization}
                  onChange={(e) => setData('organization', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter organization name"
                />
                {errors.organization && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.organization}</p>
                )}
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  value={data.position}
                  onChange={(e) => setData('position', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter position in organization"
                />
                {errors.position && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.position}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contact Number
                </label>
                <input
                  type="text"
                  id="contact_number"
                  value={data.contact_number}
                  onChange={(e) => setData('contact_number', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter contact number"
                />
                {errors.contact_number && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.contact_number}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <a
                  href={route('admin2.proponents.index')}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {processing ? 'Creating...' : 'Create Proponent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
