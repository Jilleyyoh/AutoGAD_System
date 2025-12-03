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
      <h1 className="text-2xl font-bold mb-6">Edit Domain Expertise</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block font-medium">Domain Name</label>
          <input
            type="text"
            value={data.domain_name}
            onChange={(e) => setData('domain_name', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {errors.domain_name && <p className="text-red-600">{errors.domain_name}</p>}
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {errors.description && <p className="text-red-600">{errors.description}</p>}
        </div>

        <button
          type="submit"
          disabled={processing}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Update
        </button>
      </form>
    </AppLayout>
  );
}
