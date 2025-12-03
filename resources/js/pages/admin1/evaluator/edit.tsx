import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';

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
  evaluator: Evaluator;
  domains: DomainExpertise[];
}

export default function Edit({ evaluator, domains }: Props) {
  // Log the data to help with debugging
  console.log('Edit Evaluator:', evaluator);
  console.log('Available Domains:', domains);
  
  const { data, setData, patch, processing, errors } = useForm({
    name: evaluator.user.name,
    email: evaluator.user.email,
    password: '',
    password_confirmation: '',
    domain_expertise_id: evaluator.domain_expertise_id ? evaluator.domain_expertise_id.toString() : '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Submitting form data:', data);
    patch(route('evaluators.update', evaluator.id));
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Evaluators', href: route('evaluators.index') },
        { title: 'Edit', href: route('evaluators.edit', evaluator.id) },
      ]}
    >
      <Head title="Edit Evaluator Assignment" />
      <div className="evaluator-management-fix">
      <h1 className="text-2xl font-bold mb-6">Edit Evaluator Assignment</h1>

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
        </div>        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Domain Expertise</h2>
          <div>
            <select
              value={data.domain_expertise_id}
              onChange={(e) => setData('domain_expertise_id', e.target.value)}
              className="block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a domain</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.domain_name}
                </option>
              ))}
            </select>
            {errors.domain_expertise_id && <p className="mt-1 text-sm text-red-600">{errors.domain_expertise_id}</p>}
          </div>
        </div>

        <div className="flex justify-end mt-6">
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
              <span>Update Evaluator</span>
            )}
          </button>
        </div>
      </form>
      </div>
    </AppLayout>
  );
}