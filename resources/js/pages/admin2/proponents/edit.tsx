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
      <div className="proponent-management">
        <h1 className="text-2xl font-bold mb-6">Edit Proponent</h1>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">User Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block font-medium text-gray-700">
                  New Password <span className="text-sm text-gray-500">(leave blank to keep current password)</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="password_confirmation"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
                {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6 mt-4">
            <h2 className="text-lg font-medium mb-4">Proponent Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="organization" className="block font-medium text-gray-700">Organization</label>
                <input
                  type="text"
                  id="organization"
                  value={data.organization}
                  onChange={(e) => setData('organization', e.target.value)}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter organization name"
                />
                {errors.organization && <p className="mt-1 text-sm text-red-600">{errors.organization}</p>}
              </div>

              <div>
                <label htmlFor="position" className="block font-medium text-gray-700">Position</label>
                <input
                  type="text"
                  id="position"
                  value={data.position}
                  onChange={(e) => setData('position', e.target.value)}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter position in organization"
                />
                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
              </div>

              <div>
                <label htmlFor="contact_number" className="block font-medium text-gray-700">Contact Number</label>
                <input
                  type="text"
                  id="contact_number"
                  value={data.contact_number}
                  onChange={(e) => setData('contact_number', e.target.value)}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact number"
                />
                {errors.contact_number && <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {processing ? (
                <>
                  <span className="animate-spin">⌛</span>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Proponent</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
