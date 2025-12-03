import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Award, Users, FileText, ClipboardList, ArrowRight } from 'lucide-react';
import { route } from 'ziggy-js';

const managementItems = [
    {
        title: 'Domain Expertise',
        description: 'Define and manage evaluation domains for GAD initiatives',
        icon: Award,
        href: route('domain.index'),
        color: 'blue',
        accent: 'from-blue-500 to-blue-600',
    },
    {
        title: 'Evaluators',
        description: 'Recruit and manage evaluators for assessment activities',
        icon: Users,
        href: route('evaluators.index'),
        color: 'emerald',
        accent: 'from-emerald-500 to-emerald-600',
    },
    {
        title: 'Questionnaire',
        description: 'Create and configure evaluation questionnaires',
        icon: FileText,
        href: '/questionnaire',
        color: 'purple',
        accent: 'from-purple-500 to-purple-600',
    },
    {
        title: 'Assignments',
        description: 'Assign projects to evaluators and manage workflows',
        icon: ClipboardList,
        href: '/admin1/assignments',
        color: 'orange',
        accent: 'from-orange-500 to-orange-600',
    },
];

export default function Admin1Dashboard() {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('dashboard') },
            ]}
        >
            <Head title="Dashboard" />

            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-4xl">
                        Set up and manage the evaluation framework, including domains, evaluators, questionnaires, and project assignments.
                    </p>
                </div>

                {/* Management Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {managementItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                {/* Content */}
                                <div className="relative p-6 flex flex-col h-full">
                                    {/* Icon */}
                                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300 ${
                                        item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                        item.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                        item.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                        'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                    }`}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {item.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                                        {item.description}
                                    </p>

                                    {/* Arrow */}
                                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                                        Access <ArrowRight className="w-4 h-4 ml-2" />
                                    </div>
                                </div>

                                {/* Bottom Border Accent */}
                                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${item.accent} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                            </Link>
                        );
                    })}
                </div>

                {/* Overview Section */}
                <div className="space-y-6">
                    {/* Information Cards */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                            About System Configuration
                        </h2>
                        <div className="space-y-3 text-blue-800 dark:text-blue-200 text-sm">
                            <p>
                                <strong>Admin 1</strong> is responsible for setting up the complete evaluation framework that powers the GAD System.
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>
                                    <strong>Domain Expertise:</strong> Define evaluation criteria and domains relevant to your organization's goals
                                </li>
                                <li>
                                    <strong>Evaluators:</strong> Register and manage evaluators who will assess submitted projects and activities
                                </li>
                                <li>
                                    <strong>Questionnaire:</strong> Design comprehensive evaluation forms and rating scales
                                </li>
                                <li>
                                    <strong>Assignments:</strong> Assign projects to evaluators and monitor the evaluation process
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Key Actions Section */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Setup Checklist</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                {
                                    step: '1',
                                    title: 'Set up Domain Expertise',
                                    description: 'Define evaluation criteria and domains',
                                    icon: Award,
                                },
                                {
                                    step: '2',
                                    title: 'Register Evaluators',
                                    description: 'Add evaluators to the system',
                                    icon: Users,
                                },
                                {
                                    step: '3',
                                    title: 'Create Questionnaire',
                                    description: 'Design evaluation forms',
                                    icon: FileText,
                                },
                                {
                                    step: '4',
                                    title: 'Make Assignments',
                                    description: 'Assign projects to evaluators',
                                    icon: ClipboardList,
                                },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.step} className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 text-white font-semibold text-sm">
                                                {item.step}
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">4</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configuration Modules</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">∞</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Scalable Setup</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">100%</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ready to Configure</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}