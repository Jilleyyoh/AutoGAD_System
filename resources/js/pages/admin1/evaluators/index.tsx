import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Index({ evaluators }: Props) {
  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Manage Evaluators', href: route('evaluators.index') },
      ]}
    >
      <Head title="Manage Evaluators" />
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Existing code for managing evaluators */}
        </div>
      </div>
    </AppLayout>
  );
}