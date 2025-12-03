// Rewritten clean component file after corruption
import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { themeClasses, combineTheme } from '@/lib/theme-classes';

// Types (expand as needed)
interface SupportingDocDraft { description: string; file: File | null; }
interface FormDataShape {
  title: string;
  domain_id: string | number | '';
  implementation_phase_id: string | number | '';
  description: string;
  rationale: string;
  objectives: string;
  proposal: File | null;
  memo: File | null;
  manual: File | null;
  supporting_documents: SupportingDocDraft[];
  supporting_documents_link: string;
}

// Step 1 sub-form
function ProjectInformation({ data, setData, domains, phases, errors }: any) {
  const resolveDomainName = (d: any) => d?.name || d?.title || d?.label || d?.domain_name || `Domain #${d.id}`;
  return (
    <div className="space-y-6">
      <div>
        <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={e => setData('title', e.target.value)}
          className={combineTheme('mt-1 block w-full px-4 py-2 rounded-lg border', themeClasses.input.base, themeClasses.input.focus)}
          placeholder="Enter project title"
        />
        {errors?.title && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.title}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
            Domain <span className="text-red-500">*</span>
          </label>
          <select
            value={data.domain_id}
            onChange={e => setData('domain_id', e.target.value)}
            className={combineTheme('mt-1 block w-full rounded-md shadow-sm', themeClasses.input.base, themeClasses.input.focus)}
          >
            <option value="">{domains?.length ? 'Select domain' : 'Loading domains...'}</option>
            {domains?.map((d: any) => (
              <option key={d.id} value={d.id}>{resolveDomainName(d)}</option>
            ))}
          </select>
          {errors?.domain_id && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.domain_id}</p>}
        </div>
        <div>
          <label className={combineTheme('block text-sm font-medium', themeClasses.text.primary)}>Implementation Phase <span className="text-red-500">*</span></label>
          <select
            value={data.implementation_phase_id}
            onChange={e => setData('implementation_phase_id', e.target.value)}
            className={combineTheme('mt-1 block w-full rounded-md shadow-sm', themeClasses.input.base, themeClasses.input.focus)}
          >
            <option value="">{phases?.length ? 'Select phase' : 'Loading phases...'}</option>
            {phases?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name || p.title}</option>
            ))}
          </select>
          {errors?.implementation_phase_id && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.implementation_phase_id}</p>}
        </div>
      </div>
      <div>
        <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={e => setData('description', e.target.value)}
          className={combineTheme('mt-1 block w-full px-4 py-2 rounded-lg border', themeClasses.input.base, themeClasses.input.focus)}
          rows={4}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
            Rationale
          </label>
          <textarea
            value={data.rationale}
            onChange={e => setData('rationale', e.target.value)}
            className={combineTheme('mt-1 block w-full px-4 py-2 rounded-lg border', themeClasses.input.base, themeClasses.input.focus)}
            rows={4}
          />
        </div>
        <div>
          <label className={combineTheme('block text-sm font-medium mb-2', themeClasses.text.primary)}>
            Objectives
          </label>
          <textarea
            value={data.objectives}
            onChange={e => setData('objectives', e.target.value)}
            className={combineTheme('mt-1 block w-full px-4 py-2 rounded-lg border', themeClasses.input.base, themeClasses.input.focus)}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

// Step 2 sub-form
function DocumentUpload({ data, setData, errors }: any) {
  const handleFileChange = (field: string, file: File | null) => {
    setData(field as any, file);
  };

  return (
    <div className="space-y-6">
      {['proposal','memo','manual'].map(f => (
        <div key={f}>
          <label className={combineTheme('block text-sm font-medium capitalize', themeClasses.text.primary)}>
            {f} {f === 'proposal' ? '' : f === 'proposal' && <span className="text-red-500">*</span>}
          </label>
          {data[f] ? (
            <div className={combineTheme('mt-1 block w-full text-sm px-4 py-2 rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex justify-between items-center', themeClasses.input.base)}>
              <span>{data[f].name}</span>
              <button
                type="button"
                onClick={() => setData(f as any, null)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <input
              type="file"
              onChange={e => handleFileChange(f, e.target.files?.[0] || null)}
              className={combineTheme('mt-1 block w-full text-sm px-4 py-2 rounded-lg border', themeClasses.input.base, 'file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50')}
              accept=".pdf,.doc,.docx"
            />
          )}
          {errors?.[f] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[f]}</p>}
        </div>
      ))}

      <div>
        <label className={combineTheme('block text-sm font-medium', themeClasses.text.primary)}>Supporting Documents (Link)</label>
        <input
          type="text"
          placeholder="Enter link or URL to supporting documents"
          value={data.supporting_documents_link}
          onChange={e => setData('supporting_documents_link', e.target.value)}
          className={combineTheme('mt-1 block w-full px-4 py-2 rounded-lg border', themeClasses.input.base, themeClasses.input.focus)}
        />
      </div>
    </div>
  );
}

// Step 3 sub-form
function ReviewSubmit({ data, domains, phases }: { data: FormDataShape; domains: any[]; phases: any[] }) {
  const resolveDomainName = (d: any) => d?.name || d?.title || d?.label || d?.domain_name || `Domain #${d.id}`;
  return (
    <div className="space-y-6">
      <div className={combineTheme('shadow overflow-hidden sm:rounded-lg', themeClasses.card.base)}>
        <div className="px-4 py-5 sm:px-6">
          <h3 className={combineTheme('text-lg font-medium leading-6', themeClasses.text.primary)}>Project Information</h3>
        </div>
        <div className={combineTheme('border-t px-4 py-5 sm:px-6', themeClasses.border.primary)}>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div><dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Title</dt><dd className={combineTheme('mt-1 text-sm', themeClasses.text.primary)}>{data.title}</dd></div>
            <div><dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Domain</dt><dd className={combineTheme('mt-1 text-sm', themeClasses.text.primary)}>{resolveDomainName(domains.find((d: any) => d.id == data.domain_id))}</dd></div>
            <div><dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Phase</dt><dd className={combineTheme('mt-1 text-sm', themeClasses.text.primary)}>{phases.find((p: any) => p.id == data.implementation_phase_id)?.name}</dd></div>
            <div className="sm:col-span-2"><dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Description</dt><dd className={combineTheme('mt-1 text-sm whitespace-pre-wrap', themeClasses.text.primary)}>{data.description}</dd></div>
            <div className="sm:col-span-2"><dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Rationale</dt><dd className={combineTheme('mt-1 text-sm whitespace-pre-wrap', themeClasses.text.primary)}>{data.rationale}</dd></div>
            <div className="sm:col-span-2"><dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Objectives</dt><dd className={combineTheme('mt-1 text-sm whitespace-pre-wrap', themeClasses.text.primary)}>{data.objectives}</dd></div>
          </dl>
        </div>
      </div>
      <div className={combineTheme('shadow overflow-hidden sm:rounded-lg', themeClasses.card.base)}>
        <div className="px-4 py-5 sm:px-6"><h3 className={combineTheme('text-lg font-medium leading-6', themeClasses.text.primary)}>Uploaded Documents</h3></div>
        <div className={combineTheme('border-t px-4 py-5 sm:px-6', themeClasses.border.primary)}>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div><dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Proposal</dt><dd className={combineTheme('mt-1 text-sm', themeClasses.text.primary)}>{data.proposal?.name}</dd></div>
            <div><dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Memo</dt><dd className={combineTheme('mt-1 text-sm', themeClasses.text.primary)}>{data.memo?.name}</dd></div>
            <div><dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Manual</dt><dd className={combineTheme('mt-1 text-sm', themeClasses.text.primary)}>{data.manual?.name}</dd></div>
            {data.supporting_documents_link && (
              <div className="sm:col-span-2">
                <dt className={combineTheme('text-sm font-medium', themeClasses.text.secondary)}>Supporting Documents (Link)</dt>
                <dd className={combineTheme('mt-1 text-sm text-blue-600 dark:text-blue-400', themeClasses.text.primary)}>
                  <a href={data.supporting_documents_link.startsWith('http') ? data.supporting_documents_link : `https://${data.supporting_documents_link}`} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                    {data.supporting_documents_link}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      <div className={combineTheme('border rounded-md p-4', themeClasses.alert.warning)}>
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-100">Attention Required</h3>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">Review all information before submitting. After submission edits may be restricted.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Create() {
  const { props } = usePage<any>();
  // Raw props (could arrive under various keys depending on backend implementation)
  const initialDomains = (props?.domains ?? props?.domain_expertise ?? props?.domainExpertise ?? []) as any[];
  const phases = (props?.phases ?? props?.implementation_phases ?? []) as any[];
  // Local state so we can lazy-load if not provided
  const [domainsState, setDomainsState] = useState<any[]>(initialDomains);

  const [currentStep, setCurrentStep] = useState(1);
  const [agreement, setAgreement] = useState(false);
  // Session-based draft (no id persisted)

  const { data, setData, post, processing, errors, reset } = useForm<FormDataShape>({
    title: '',
    domain_id: '',
    implementation_phase_id: '',
    description: '',
    rationale: '',
    objectives: '',
    proposal: null,
    memo: null,
    manual: null,
    supporting_documents: [],
    supporting_documents_link: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/proponent/pap/draft');
        if (res.data?.draft) {
          const draft = res.data.draft;
          setData('title', draft.title || '');
          setData('domain_id', draft.domain_id || '');
          setData('implementation_phase_id', draft.implementation_phase_id || '');
          setData('description', draft.description || '');
          setData('rationale', draft.rationale || '');
          setData('objectives', draft.objectives || '');
          setData('supporting_documents', draft.supporting_documents || []);
          setData('supporting_documents_link', draft.supporting_documents_link || '');
        }
      } catch (_) {}
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  // If domains were not injected, attempt to fetch them lazily
  useEffect(() => {
    if (domainsState.length === 0) {
      axios.get('/proponent/domains')
        .then(r => {
          const incoming = r.data?.domains || r.data || [];
          if (Array.isArray(incoming) && incoming.length) {
            setDomainsState(incoming);
          }
        })
        .catch(() => {/* silent */});
    }
  }, [domainsState.length]);

  // Dev aid: log domains once (won't spam due to ref length dependency)
  if (process.env.NODE_ENV !== 'production' && domainsState.length) {
    // eslint-disable-next-line no-console
    console.debug('[PAP/Create] Domains available for dropdown:', domainsState.map(d => ({ id: d.id, keys: Object.keys(d) })));
  }

  const steps = [
    { number: 1, name: 'Project Information' },
    { number: 2, name: 'Document Upload' },
    { number: 3, name: 'Review & Submit' },
  ];

  const saveDraft = async () => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'supporting_documents') {
        (value as SupportingDocDraft[]).forEach((doc, i) => {
          if (doc.file) {
            formData.append(`supporting_documents[${i}][file]`, doc.file);
            formData.append(`supporting_documents[${i}][description]`, doc.file);
          } else if (doc.description) {
            formData.append(`supporting_documents[${i}][description]`, doc.description);
          }
        });
      } else if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // skip other arrays
      } else {
        formData.append(key, value == null ? '' : String(value));
      }
    });
    try {
      await axios.post('/proponent/pap/draft', formData);
    } catch (e) {
      // Silently ignore for now, could add toast
    }
  };

  const handleNextStep = async () => {
    await saveDraft();
    setCurrentStep(s => Math.min(s + 1, steps.length));
  };

  const handlePrevStep = async () => {
    await saveDraft();
    setCurrentStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveDraft();
    if (currentStep === 3 && agreement) {
      post(route('proponent.pap.store'));
    }
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: '/proponent/dashboard' },
        { title: 'Submit PAP', href: route('proponent.pap.create') },
      ]}
    >
      <Head title="Submit PAP" />
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <nav aria-label="Progress">
              <ol role="list" className={combineTheme('border rounded-md divide-y md:flex md:divide-y-0 shadow-sm', themeClasses.border.primary)}>
                {steps.map(step => (
                  <li key={step.name} className="relative md:flex-1 md:flex">
                    <div className={`group flex items-center w-full ${
                      currentStep === step.number ? 'bg-blue-600' : currentStep > step.number ? 'bg-green-600' : ''
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

          <form onSubmit={handleSubmit} className={combineTheme('shadow-sm rounded-lg p-6 space-y-8', themeClasses.card.base)}>
            {currentStep === 1 && (
              <ProjectInformation data={data} setData={setData} domains={domainsState} phases={phases} errors={errors} />
            )}
            {currentStep === 2 && (
              <DocumentUpload data={data} setData={setData} errors={errors} />
            )}
            {currentStep === 3 && (
              <>
                <ReviewSubmit data={data} domains={domainsState} phases={phases} />
                <div className="mt-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={agreement}
                      onChange={e => setAgreement(e.target.checked)}
                      className={combineTheme('h-4 w-4 rounded', themeClasses.input.base, 'text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400')}
                    />
                    <span className={combineTheme('text-sm', themeClasses.text.primary)}>I confirm the information is accurate and complete.</span>
                  </label>
                </div>
              </>
            )}
            <div className="pt-4 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className={combineTheme('inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md', themeClasses.button.secondary)}
                >Previous</button>
              )}
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className={combineTheme('ml-auto inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md', themeClasses.button.primary)}
                >Next</button>
              ) : (
                <button
                  type="submit"
                  disabled={processing || !agreement}
                  className={combineTheme('ml-auto inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white', processing || !agreement ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500')}
                >{processing ? 'Submitting...' : 'Submit PAP'}</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}