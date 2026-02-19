import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { AlertCircle, Download, FileText, Search } from 'lucide-react';
import { route } from 'ziggy-js';

interface Certificate {
  id: number;
  project_title: string;
  project_code: string;
  certification_date: string;
  issue_date: string;
  status: string;
  questionnaire_version: string;
  proponent_name: string;
  organization: string;
  can_download: boolean;
}

interface Props {
  certificates: Certificate[];
  error?: string;
  highlightCertificateId?: number;
}

export default function Certificates({ certificates = [], error, highlightCertificateId }: Props) {
  // Scroll and highlight effect
  useEffect(() => {
    if (highlightCertificateId) {
      const element = document.querySelector(`div[data-certificate-id="${highlightCertificateId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightCertificateId]);

  const [search, setSearch] = useState('');

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; border: string; text: string }> = {
      'certified': { bg: 'bg-indigo-50 dark:bg-indigo-900/10', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300' },
      'pending': { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300' },
      'approved': { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300' },
      'rejected': { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300' },
      'Certified': { bg: 'bg-indigo-50 dark:bg-indigo-900/10', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300' },
      'Pending': { bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300' },
      'Approved': { bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300' },
      'Rejected': { bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300' },
    };
    
    const style = statusStyles[status] || statusStyles['Pending'];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${style.bg} ${style.border} ${style.text}`}>
        {status}
      </span>
    );
  };

  const filteredCertificates = certificates.filter(cert => 
    cert.project_title.toLowerCase().includes(search.toLowerCase()) ||
    cert.project_code.toLowerCase().includes(search.toLowerCase()) ||
    cert.proponent_name.toLowerCase().includes(search.toLowerCase()) ||
    cert.organization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: route('evaluator.dashboard') }, { title: 'Certificates', href: route('evaluator.certificates.index') }]}>
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Certificates</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">View and download certificates for projects you evaluated</p>
          </div>

          {/* Info Card */}
          <div className="mb-8 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">About Certificates</h3>
                <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                  View and download certificates for projects you have successfully evaluated. Certificates are generated once projects are certified by Admin2.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by project code, title, proponent, or organization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {filteredCertificates.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">No certificates found</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">No certificates match your search criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredCertificates.map(cert => {
                const isHighlighted = highlightCertificateId && cert.id === highlightCertificateId;
                return (
                <div 
                  key={cert.id} 
                  data-certificate-id={cert.id}
                  className={`bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition border ${
                    isHighlighted 
                      ? 'border-blue-500 shadow-lg ring-2 ring-blue-400 dark:ring-blue-500' 
                      : 'border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {cert.project_title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Project Code: <span className="font-mono font-semibold">{cert.project_code}</span>
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-500 text-xs uppercase">Issue Date</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{cert.issue_date}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-500 text-xs uppercase">Status</p>
                            <p className="mt-1">{getStatusBadge(cert.status)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-500 text-xs uppercase">Questionnaire</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{cert.questionnaire_version}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-500 text-xs uppercase">Proponent</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{cert.proponent_name}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-500 text-xs uppercase">Organization</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{cert.organization}</p>
                          </div>
                        </div>
                      </div>

                      {cert.can_download ? (
                        <a
                          href={route('evaluator.certificates.download', cert.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition font-semibold whitespace-nowrap"
                          download
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </a>
                      ) : (
                        <button
                          disabled
                          className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg cursor-not-allowed opacity-50 font-semibold whitespace-nowrap"
                        >
                          <Download className="w-4 h-4" />
                          Not Available
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

