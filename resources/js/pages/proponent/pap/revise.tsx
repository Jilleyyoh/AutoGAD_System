import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { themeClasses, combineTheme } from '@/lib/theme-classes';

interface SupportingDocDraft { 
  description: string; 
  file: File | null;
  id?: number; // For old documents
  original_name?: string; // For old documents display
  is_existing?: boolean; // Flag to distinguish old vs new
}

interface DocumentItem {
  id: number;
  original_name: string;
  type: string;
  download_route: string;
}

interface Props {
  project: any;
  remarks: string;
  documents: DocumentItem[];
  domains: Array<{ id: number; name: string }>;
  phases: Array<{ id: number; name: string }>;
}

// Step 1: Project Information with Remarks
function RemarksAndProjectInfo({ data, setData, remarks, domains, phases, errors }: any) {
  return (
    <div className="space-y-8">
      {/* Remarks Section */}
      <div>
        <h3 className={combineTheme('text-lg font-semibold mb-4', themeClasses.text.primary)}>
          Evaluator's Remarks
        </h3>
        <div className={combineTheme('rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500', themeClasses.card.base)}>
          <p className={combineTheme('text-base whitespace-pre-wrap', themeClasses.text.primary)}>
            {remarks}
          </p>
        </div>
      </div>

      {/* Project Information */}
      <div>
        <h3 className={combineTheme('text-lg font-semibold mb-4', themeClasses.text.primary)}>
          Update Project Information
        </h3>
        <div className="space-y-6">
          <div>
            <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
              Project Title
            </label>
            <input
              type="text"
              value={data.title}
              onChange={e => setData('title', e.target.value)}
              className={combineTheme('w-full rounded-lg shadow-sm', themeClasses.input.base, themeClasses.input.focus)}
            />
            {errors?.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
                Domain
              </label>
              <select
                value={data.domain_id}
                onChange={e => setData('domain_id', parseInt(e.target.value))}
                className={combineTheme('w-full rounded-lg shadow-sm', themeClasses.input.base, themeClasses.input.focus)}
              >
                {domains.map((d: { id: number; name: string }) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors?.domain_id && <p className="text-red-600 text-sm mt-1">{errors.domain_id}</p>}
            </div>

            <div>
              <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
                Implementation Phase
              </label>
              <select
                value={data.implementation_phase_id}
                onChange={e => setData('implementation_phase_id', parseInt(e.target.value))}
                className={combineTheme('w-full rounded-lg shadow-sm', themeClasses.input.base, themeClasses.input.focus)}
              >
                {phases.map((p: { id: number; name: string }) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors?.implementation_phase_id && <p className="text-red-600 text-sm mt-1">{errors.implementation_phase_id}</p>}
            </div>
          </div>

          <div>
            <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
              Description
            </label>
            <textarea
              value={data.description}
              onChange={e => setData('description', e.target.value)}
              rows={4}
              className={combineTheme('w-full rounded-lg shadow-sm', themeClasses.input.base, themeClasses.input.focus)}
            />
            {errors?.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
                Rationale
              </label>
              <textarea
                value={data.rationale}
                onChange={e => setData('rationale', e.target.value)}
                rows={3}
                className={combineTheme('w-full rounded-lg shadow-sm', themeClasses.input.base, themeClasses.input.focus)}
              />
            </div>

            <div>
              <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
                Objectives
              </label>
              <textarea
                value={data.objectives}
                onChange={e => setData('objectives', e.target.value)}
                rows={3}
                className={combineTheme('w-full rounded-lg shadow-sm', themeClasses.input.base, themeClasses.input.focus)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Document Upload
function DocumentUpdate({ data, setData, initialDocs }: any) {
  const handleFileChange = (field: string, file: File | null) => {
    setData({ ...data, [field]: file });
  };

  return (
    <div className="space-y-6">
      {/* Primary Documents - Proposal, Memo, Manual */}
      {['proposal', 'memo', 'manual'].map(f => {
        const existingDoc = initialDocs?.find((d: DocumentItem) => d.type === f);
        return (
          <div key={f}>
            <label className={combineTheme('block text-sm font-medium capitalize', themeClasses.text.primary)}>
              {f}
              {existingDoc && <span className="text-green-600 dark:text-green-400 ml-2">(already uploaded)</span>}
            </label>
            {existingDoc && (
              <div className={combineTheme('mt-2 p-3 rounded-md text-sm', themeClasses.alert.success)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={combineTheme('font-medium', themeClasses.text.primary)}>{existingDoc.original_name}</p>
                    <p className={combineTheme('text-xs mt-1', themeClasses.text.secondary)}>Current: {existingDoc.original_name}</p>
                  </div>
                  <a href={existingDoc.download_route} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium">
                    Download
                  </a>
                </div>
                <p className={combineTheme('text-xs mt-2', themeClasses.text.secondary)}>Upload a new file below to replace it:</p>
              </div>
            )}
            <input
              type="file"
              onChange={e => handleFileChange(f, e.target.files?.[0] || null)}
              className={combineTheme('mt-2 block w-full text-sm', themeClasses.input.base, 'file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50')}
              accept=".pdf,.doc,.docx"
            />
            {(data as any)?.[f]?.name && (
              <p className={combineTheme('mt-1 text-xs text-amber-600 dark:text-amber-400', themeClasses.text.secondary)}>
                New file selected: {(data as any)[f].name}
              </p>
            )}
          </div>
        );
      })}

      {/* Supporting Documents */}
      <div>
        <label className={combineTheme('block text-sm font-medium', themeClasses.text.primary)}>Supporting Documents (Link)</label>
        {data.supporting_documents_link && (
          <div className={combineTheme('mt-2 p-3 rounded-md text-sm', themeClasses.alert.success)}>
            <p className={combineTheme('text-xs', themeClasses.text.secondary)}>Current link:</p>
            <p className={combineTheme('font-medium text-blue-600 dark:text-blue-400 truncate', themeClasses.text.primary)}>{data.supporting_documents_link}</p>
            <p className={combineTheme('text-xs mt-2', themeClasses.text.secondary)}>Edit or clear the field below to update:</p>
          </div>
        )}
        <input
          type="text"
          placeholder="Enter link or URL to supporting documents"
          value={data.supporting_documents_link}
          onChange={e => setData({ ...data, supporting_documents_link: e.target.value })}
          className={combineTheme('mt-2 block w-full rounded-md shadow-sm', themeClasses.input.base, themeClasses.input.focus)}
        />
      </div>
    </div>
  );
}

// Step 3: Review & Submit
function ReviewSubmit({ data, initialDocs, domainName, phaseName }: any) {
  return (
    <div className="space-y-6">
      <div className={combineTheme('rounded-lg p-6 bg-gray-50 dark:bg-slate-700/50', themeClasses.card.base)}>
        <h3 className={combineTheme('text-lg font-semibold mb-4', themeClasses.text.primary)}>
          Revised Project Information
        </h3>
        <dl className="space-y-4">
          <div>
            <dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Title</dt>
            <dd className={combineTheme('mt-1 text-base', themeClasses.text.primary)}>{data.title}</dd>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Domain</dt>
              <dd className={combineTheme('mt-1 text-base', themeClasses.text.primary)}>{domainName}</dd>
            </div>
            <div>
              <dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Phase</dt>
              <dd className={combineTheme('mt-1 text-base', themeClasses.text.primary)}>{phaseName}</dd>
            </div>
          </div>
          <div>
            <dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Description</dt>
            <dd className={combineTheme('mt-1 text-base whitespace-pre-wrap', themeClasses.text.primary)}>{data.description}</dd>
          </div>
          <div>
            <dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Rationale</dt>
            <dd className={combineTheme('mt-1 text-base whitespace-pre-wrap', themeClasses.text.primary)}>{data.rationale}</dd>
          </div>
          <div>
            <dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Objectives</dt>
            <dd className={combineTheme('mt-1 text-base whitespace-pre-wrap', themeClasses.text.primary)}>{data.objectives}</dd>
          </div>
        </dl>
      </div>

      <div className={combineTheme('rounded-lg p-6 bg-gray-50 dark:bg-slate-700/50', themeClasses.card.base)}>
        <h3 className={combineTheme('text-lg font-semibold mb-4', themeClasses.text.primary)}>
          Documents
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          {/* Primary Documents from Initial Submission */}
          {['proposal', 'memo', 'manual'].map(docType => {
            const existingDoc = initialDocs?.find((d: DocumentItem) => d.type === docType);
            const newFile = (data as any)?.[docType];
            return (
              <div key={docType}>
                <dt className={combineTheme('text-sm font-medium capitalize', themeClasses.text.secondary)}>{docType}</dt>
                <dd className={combineTheme('mt-1 text-sm', themeClasses.text.primary)}>
                  {newFile?.name ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      {newFile.name} <span className="text-xs">(new)</span>
                    </span>
                  ) : existingDoc ? (
                    <span className="text-green-600 dark:text-green-400">
                      {existingDoc.original_name} <span className="text-xs">(from initial)</span>
                    </span>
                  ) : (
                    <span className={combineTheme('', themeClasses.text.secondary)}>Not provided</span>
                  )}
                </dd>
              </div>
            );
          })}

          {/* Supporting Documents */}
          {(() => {
            const supportingDocsToDisplay = data.supporting_documents.filter((doc: SupportingDocDraft) => doc.file !== null);
            return supportingDocsToDisplay.length > 0 || data.supporting_documents_link ? (
              <div className="sm:col-span-2">
                <dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Supporting Documents</dt>
                <dd className="mt-1 space-y-2">
                  {data.supporting_documents_link && (
                    <div className={combineTheme('text-sm', themeClasses.text.primary)}>
                      <span className="font-medium">Link:</span>
                      <a href={data.supporting_documents_link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 dark:text-blue-400 underline hover:no-underline">
                        {data.supporting_documents_link}
                      </a>
                    </div>
                  )}
                  {supportingDocsToDisplay.map((doc: SupportingDocDraft, i: number) => (
                    <div key={i} className={combineTheme('text-sm', themeClasses.text.primary)}>
                      {doc.description || `Document ${i + 1}`}:
                      <span className="text-amber-600 dark:text-amber-400 ml-1">{doc.file?.name} (new)</span>
                    </div>
                  ))}
                </dd>
              </div>
            ) : null;
          })()}
        </dl>
      </div>

      <div className={combineTheme('border rounded-lg p-4', themeClasses.alert.info)}>
        <p className={combineTheme('text-sm', themeClasses.text.primary)}>
          After submitting your revised project, it will be sent back to evaluators for re-evaluation. Your project status will change to "For Evaluation".
        </p>
      </div>
    </div>
  );
}

export default function Revise() {
  const { project, remarks, documents: initialDocs, domains, phases } = usePage<any>().props as Props;
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const steps = [
    { number: 1, name: 'Remarks & Project Info' },
    { number: 2, name: 'Documents' },
    { number: 3, name: 'Review & Submit' },
  ];

  // Initialize supporting documents with old docs pre-loaded
  const [data, setData] = useState({
    title: project.title,
    domain_id: project.domain_id,
    implementation_phase_id: project.implementation_phase_id,
    description: project.description,
    rationale: project.rationale,
    objectives: project.objectives,
    proposal: null,
    memo: null,
    manual: null,
    supporting_documents: (initialDocs || []).map((doc: DocumentItem) => ({
      description: '',
      file: null,
      id: doc.id,
      original_name: doc.original_name,
      is_existing: true
    })),
    supporting_documents_link: project.supporting_documents_link || ''
  });

  const updateData = (key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    setCurrentStep(s => Math.min(s + 1, steps.length));
  };

  const handlePrevStep = () => {
    setCurrentStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('domain_id', String(data.domain_id));
      formData.append('implementation_phase_id', String(data.implementation_phase_id));
      formData.append('description', data.description);
      formData.append('rationale', data.rationale);
      formData.append('objectives', data.objectives);
      formData.append('supporting_documents_link', data.supporting_documents_link);

      // Process all documents - primary documents (proposal/memo/manual) + supporting documents
      let docIdx = 0;
      
      // Primary documents (proposal, memo, manual) - send if user uploaded new ones
      const primaryDocs = ['proposal', 'memo', 'manual'];
      primaryDocs.forEach(docType => {
        if ((data as any)[docType]) {  // If user uploaded a new primary doc
          formData.append(`documents[${docIdx}][file]`, (data as any)[docType]);
          formData.append(`documents[${docIdx}][type]`, docType);
          docIdx++;
        }
      });

      // Supporting documents - only send if file exists
      data.supporting_documents.forEach((doc: SupportingDocDraft) => {
        if (doc.file) {
          formData.append(`documents[${docIdx}][file]`, doc.file);
          formData.append(`documents[${docIdx}][type]`, 'supporting');
          formData.append(`documents[${docIdx}][description]`, doc.description);
          docIdx++;
        }
      });

      const response = await axios.post(route('proponent.pap.revise', project.id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        window.location.href = route('proponent.pap.submissions');
      }
    } catch (error: any) {
      console.error('Error submitting revision:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Error submitting revision: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const domainName = domains.find(d => d.id === data.domain_id)?.name || 'N/A';
  const phaseName = phases.find(p => p.id === data.implementation_phase_id)?.name || 'N/A';

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: route('proponent.dashboard') },
        { title: 'Track Submissions', href: route('proponent.pap.submissions') },
        { title: `${project.project_code} - Revise`, href: '#' },
      ]}
    >
      <Head title={`Revise ${project.project_code}`} />

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={combineTheme('text-3xl font-bold', themeClasses.text.primary)}>
            Revise Submission: {project.project_code}
          </h1>
          <p className={combineTheme('mt-2 text-sm', themeClasses.text.secondary)}>
            Review the evaluator's feedback and update your project details and documents.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol role="list" className={combineTheme('border rounded-md divide-y md:flex md:divide-y-0', themeClasses.border.primary)}>
              {steps.map(step => (
                <li key={step.name} className="relative md:flex-1 md:flex">
                  <div className={`group flex items-center w-full ${
                    currentStep === step.number ? 'bg-blue-600' : currentStep > step.number ? 'bg-green-600' : 'dark:bg-slate-700'
                  }`}>
                    <span className={combineTheme('px-6 py-4 flex items-center text-sm font-medium', currentStep !== step.number && currentStep <= step.number ? themeClasses.text.primary : '')}>
                      <span className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${
                        currentStep === step.number
                          ? 'bg-blue-800 text-white'
                          : currentStep > step.number
                          ? 'bg-green-800 text-white'
                          : 'border-2 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400'
                      }`}>
                        {currentStep > step.number ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span>{step.number}</span>
                        )}
                      </span>
                      <span className={`ml-4 text-sm font-medium ${
                        currentStep >= step.number ? 'text-white' : combineTheme('', themeClasses.text.secondary)
                      }`}>{step.name}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Form */}
        <div className={combineTheme('shadow-sm rounded-lg p-8 space-y-8', themeClasses.card.base)}>
          {currentStep === 1 && (
            <RemarksAndProjectInfo 
              data={data} 
              setData={updateData} 
              remarks={remarks} 
              domains={domains} 
              phases={phases}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <DocumentUpdate 
              data={data} 
              setData={setData} 
              initialDocs={initialDocs}
            />
          )}

          {currentStep === 3 && (
            <ReviewSubmit 
              data={data} 
              initialDocs={initialDocs}
              domainName={domainName}
              phaseName={phaseName}
            />
          )}

          {/* Navigation Buttons */}
          <div className="pt-6 flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className={combineTheme('inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md', themeClasses.button.secondary)}
              >
                Previous
              </button>
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNextStep}
                className={combineTheme('ml-auto inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md', themeClasses.button.primary)}
              >
                Next
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="ml-auto">
                <button
                  type="submit"
                  disabled={submitting}
                  className={combineTheme('inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white', submitting ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500')}
                >
                  {submitting ? 'Submitting...' : 'Submit Revision'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
