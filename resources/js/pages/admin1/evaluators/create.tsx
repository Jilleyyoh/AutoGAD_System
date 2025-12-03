// // filepath: /Users/jennifer/Sites/GAD_system/resources/js/pages/admin1/evaluators/create.tsx
// import React from 'react';
// import { Head, useForm } from '@inertiajs/react';
// import AppLayout from '@/layouts/app-layout';
// import { route } from 'ziggy-js';

// interface Props {
//   // Add any props if needed
// }

// export default function Create({}: Props) {
//   const { data, setData, post, processing, errors } = useForm({
//     name: '',
//     email: '',
//     evaluator_title: '',
//     domain_expertise_id: '',
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     post(route('admin1.evaluators.store'));
//   };

//   return (
//     <AppLayout
//       breadcrumbs={[
//         { title: 'Dashboard', href: route('dashboard') },
//         { title: 'Evaluators', href: route('admin1.evaluators.index') },
//         { title: 'Create', href: route('admin1.evaluators.create') },
//       ]}
//       sidebarOpen={true}
//     >
//       <Head title="Create Evaluator" />

//       <div className="min-h-screen bg-white dark:bg-black">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//               Create Evaluator
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-2">
//               Add a new evaluator to the system.
//             </p>
//           </div>

//           <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mx-4 sm:mx-6 lg:mx-8">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   value={data.name}
//                   onChange={(e) => setData('name', e.target.value)}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
//                   required
//                 />
//                 {errors.name && (
//                   <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
//                 )}
//               </div>

//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   value={data.email}
//                   onChange={(e) => setData('email', e.target.value)}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
//                   required
//                 />
//                 {errors.email && (
//                   <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
//                 )}
//               </div>

//               <div>
//                 <label htmlFor="evaluator_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Evaluator Title
//                 </label>
//                 <input
//                   type="text"
//                   id="evaluator_title"
//                   value={data.evaluator_title}
//                   onChange={(e) => setData('evaluator_title', e.target.value)}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
//                 />
//                 {errors.evaluator_title && (
//                   <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.evaluator_title}</p>
//                 )}
//               </div>

//               <div>
//                 <label htmlFor="domain_expertise_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                   Domain Expertise ID
//                 </label>
//                 <input
//                   type="number"
//                   id="domain_expertise_id"
//                   value={data.domain_expertise_id}
//                   onChange={(e) => setData('domain_expertise_id', e.target.value)}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
//                 />
//                 {errors.domain_expertise_id && (
//                   <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.domain_expertise_id}</p>
//                 )}
//               </div>

//               <div className="flex justify-end space-x-4">
//                 <a
//                   href={route('admin1.evaluators.index')}
//                   className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
//                 >
//                   Cancel
//                 </a>
//                 <button
//                   type="submit"
//                   disabled={processing}
//                   className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition disabled:opacity-50"
//                 >
//                   {processing ? 'Creating...' : 'Create Evaluator'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </AppLayout>
//   );
// }