import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';

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
  proponent: Proponent;
}

export default function Edit({ proponent }: Props) {
  // Log the data to help with debugging
  console.log('Edit Proponent:', proponent);
  
  const { data, setData, patch, processing, errors } = useForm({
    name: proponent.user.name,
    email: proponent.user.email,
    password: '',
    password_confirmation: '',
    organization: proponent.organization || '',
    position: proponent.position || '',
    contact_number: proponent.contact_number || '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Submitting form data:', data);
    patch(route('admin2.proponents.update', proponent.id));
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Proponents', href: route('admin2.proponents.index') },
        { title: 'Edit', href: route('admin2.proponents.edit', proponent.id) },
      ]}
    >
      <Head title="Edit Proponent" />
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Proponent</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Edit proponent details for project submissions.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
                {errors.name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  id="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
                {errors.email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password <span className="text-sm text-gray-500">(leave blank to keep current password)</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter new password"
                />
                {errors.password && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Confirm new password"
                />
                {errors.password_confirmation && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password_confirmation}</p>}
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organization</label>
                <input
                  type="text"
                  id="organization"
                  value={data.organization}
                  onChange={(e) => setData('organization', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter organization name"
                />
                {errors.organization && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.organization}</p>}
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
                <input
                  type="text"
                  id="position"
                  value={data.position}
                  onChange={(e) => setData('position', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter position in organization"
                />
                {errors.position && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.position}</p>}
              </div>

              <div>
                <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                <input
                  type="text"
                  id="contact_number"
                  value={data.contact_number}
                  onChange={(e) => setData('contact_number', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter contact number"
                />
                {errors.contact_number && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.contact_number}</p>}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-[#5a189a] dark:bg-[#5a189a] text-white rounded-lg hover:bg-[#4a0e7a] dark:hover:bg-[#4a0e7a] transition disabled:opacity-50"
                >
                  {processing ? 'Updating...' : 'Update Proponent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
