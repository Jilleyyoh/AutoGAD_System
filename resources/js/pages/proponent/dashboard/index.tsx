import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { FileText, Award, Send, Trophy } from 'lucide-react';

interface CertificateStats {
  total: number;
  certified: number;
  pending: number;
  approved: number;
}

export default function ProponentDashboard() {
  const [stats, setStats] = useState<CertificateStats>({ total: 0, certified: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch certificate stats
    fetch(route('proponent.certificates.stats'))
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching certificate stats:', err);
        setLoading(false);
      });
  }, []);

  return (
    <AppLayout>
      <div className="p-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Proponent Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your projects and track certifications</p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Submit Project Card */}
          <Link href={route('proponent.pap.create')} className="block group">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 dark:border-slate-700 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition">
                    <Send className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Submit Project</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Submit a new Positive Agenda Projects (PAP) for evaluation</p>
              <div className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:gap-2 transition-all">
                Get Started
                <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          {/* Track Submissions Card */}
          <Link href={route('proponent.pap.submissions')} className="block group">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 dark:border-slate-700 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Track Submissions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monitor the status and evaluation progress of your submitted projects</p>
              <div className="mt-4 inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold text-sm group-hover:gap-2 transition-all">
                View Submissions
                <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          {/* Certificates Card */}
          <Link href={route('proponent.certificates.index')} className="block group">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition p-6 border border-gray-200 dark:border-slate-700 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition">
                    <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{loading ? '-' : stats.total}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Certificates</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">View and download your project certificationsZZZZ</p>
              <div className="mt-4 inline-flex items-center text-green-600 dark:text-green-400 font-semibold text-sm group-hover:gap-2 transition-all">
                View Certificates
                <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Certificate Stats */}
        {!loading && stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase">Total Certificates</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase">Certified</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.certified}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase">Approved</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{stats.approved}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{stats.pending}</p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Getting Started</h3>
          <p className="text-blue-800 dark:text-blue-200">
            Welcome to the GAD System! Start by submitting your project, then track its evaluation progress. Once certified, your certificates will be available for download.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
