import React, { useEffect, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { BarChart3, AlertCircle, CheckCircle2, Settings, Layers, Zap, Plus, Edit2, Trash2, ChevronDown, ChevronRight, Clock, RefreshCw } from 'lucide-react';
import VersionInfo from '@/components/version-info';
import { themeClasses, combineTheme } from '@/lib/theme-classes';

interface QuestionnaireItem {
  id: number;
  category_id: number;
  item_number: string;
  question: string;
  score_options: string;
  max_score: number;
  display_order: number;
  is_active: boolean;
  version: string;
}

interface QuestionnaireCategory {
  id: number;
  category_name: string;
  description?: string;
  max_score: number;
  display_order: number;
  is_active: boolean;
  version: string;
  items: QuestionnaireItem[];
  equal_distribution_enabled: boolean;
}

interface QuestionnaireSettings {
  version: string;
  passing_score: string;
}

interface ScoreInterpretation {
  id: number;
  score_min: number;
  score_max: number;
  interpretation: string;
  description: string;
  version: string;
}

interface VersionData {
  id: number;
  version_number: string;
  status: 'active' | 'archived' | 'draft';
  is_active: boolean;
  created_at: string;
  description?: string;
  evaluation_count: number;
  snapshot: {
    categories: any[];
    questions?: any[];
    question_count?: number;
    category_count?: number;
    total_max_score?: number;
    total_points?: number;
  };
}

interface Props {
  settings: QuestionnaireSettings;
  categories?: QuestionnaireCategory[];
  interpretations?: ScoreInterpretation[];
  versions?: VersionData[];
}

export default function Index({ settings, categories = [], interpretations = [], versions = [] }: Props) {
  // UI State - Tab and Modal Management
  const [activeTab, setActiveTab] = useState('settings');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showInterpretationModal, setShowInterpretationModal] = useState(false);

  // Edit/Create State
  const [editingCategory, setEditingCategory] = useState<QuestionnaireCategory | null>(null);
  const [editingItem, setEditingItem] = useState<QuestionnaireItem | null>(null);
  const [editingInterpretation, setEditingInterpretation] = useState<ScoreInterpretation | null>(null);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<QuestionnaireItem | null>(null);
  const [interpretationToDelete, setInterpretationToDelete] = useState<ScoreInterpretation | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<QuestionnaireCategory | null>(null);

  // Display State
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [selectedVersion, setSelectedVersion] = useState<VersionData | null>(null);
  const [selectedCategoryForQuestion, setSelectedCategoryForQuestion] = useState<number | null>(null);

  // Question/Item Form State
  // useEqualDistribution removed - scoring is now always automatic

  // Redistribution/Processing State removed - scoring is now always automatic

  useEffect(() => {
    if (categories && categories.length > 0) {
      const allCategoryIds = new Set(categories.map(cat => cat.id));
      setExpandedCategories(allCategoryIds);
    }
  }, [categories]);

  const { flash } = usePage().props as any;
  
  const { data, setData, post, processing, errors, reset } = useForm({
    version: settings.version,
    passing_score: settings.passing_score,
  });

  const { data: categoryData, setData: setCategoryData, post: postCategory, put: putCategory, processing: categoryProcessing, errors: categoryErrors, reset: resetCategory } = useForm({
    category_name: '',
    description: '',
    max_score: '',
    display_order: '',
  });

  const { data: itemData, setData: setItemData, post: postItem, put: putItem, delete: deleteItem, processing: itemProcessing, errors: itemErrors, reset: resetItem } = useForm({
    category_id: '',
    question: '',
    score_options: '',
    display_order: '',
    is_active: true,
  });

  const { data: interpretationData, setData: setInterpretationData, post: postInterpretation, put: putInterpretation, delete: deleteInterpretation, processing: interpretationProcessing, errors: interpretationErrors, reset: resetInterpretation } = useForm({
    score_min: '',
    score_max: '',
    interpretation: '',
    description: '',
  });

  const { delete: deleteCategory } = useForm();

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate version format
    const versionRegex = /^\d+\.\d+$/;
    if (!versionRegex.test(data.version)) {
      alert('❌ Version must be in decimal format (e.g., 1.0, 1.1)');
      return;
    }
    
    // Validate passing score
    const passingScore = parseFloat(data.passing_score);
    if (isNaN(passingScore) || passingScore < 0) {
      alert('❌ Passing score must be a valid positive number');
      return;
    }
    
    // Validate passing score doesn't exceed total max score
    const totalMaxScore = getSafeMaxScore();
    if (totalMaxScore > 0 && passingScore > totalMaxScore) {
      alert(`❌ Passing score (${passingScore.toFixed(2)}) cannot exceed the total maximum score of ${totalMaxScore.toFixed(2)}`);
      return;
    }
    
    // All validations passed
    post(route('questionnaire.updateSettings'));
  };

  const handleAddCategory = () => {
    resetCategory();
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: QuestionnaireCategory) => {
    setEditingCategory(category);
    setCategoryData({
      category_name: category.category_name,
      description: category.description || '',
      max_score: category.max_score.toString(),
      display_order: category.display_order.toString(),
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!categoryData.category_name.trim()) {
      alert('❌ Category name is required');
      return;
    }
    
    const maxScore = parseFloat(categoryData.max_score);
    if (isNaN(maxScore) || maxScore <= 0) {
      alert('❌ Max score must be a valid positive number');
      return;
    }
    
    const displayOrder = parseInt(categoryData.display_order);
    if (isNaN(displayOrder) || displayOrder < 1) {
      alert('❌ Display order must be a valid number');
      return;
    }
    
    if (editingCategory) {
      putCategory(route('questionnaire.categories.update', editingCategory.id), {
        onSuccess: () => {
          setShowCategoryModal(false);
          resetCategory();
          setEditingCategory(null);
        }
      });
    } else {
      postCategory(route('questionnaire.categories.store'), {
        onSuccess: () => {
          setShowCategoryModal(false);
          resetCategory();
        }
      });
    }
  };

  const handleAddItem = () => {
    resetItem();
    setEditingItem(null);
    if (selectedCategoryForQuestion) {
      setItemData('category_id', selectedCategoryForQuestion.toString());
    }
    setShowItemModal(true);
  };

  const handleAddItemToCategory = (categoryId: number) => {
    resetItem();
    setEditingItem(null);
    setSelectedCategoryForQuestion(categoryId);
    setItemData('category_id', categoryId.toString());
    setShowItemModal(true);
  };

  const handleEditItem = (item: QuestionnaireItem) => {
    setEditingItem(item);
    setItemData({
      category_id: item.category_id.toString(),
      question: item.question,
      score_options: item.score_options,
      display_order: item.display_order.toString(),
      is_active: item.is_active,
    });
    setSelectedCategoryForQuestion(item.category_id);
    setShowItemModal(true);
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!itemData.category_id) {
      alert('❌ Please select a category');
      return;
    }
    
    if (!itemData.question.trim()) {
      alert('❌ Question is required');
      return;
    }
    
    // Score options are auto-generated on the backend - no need to validate here
    
    const displayOrder = parseInt(itemData.display_order);
    if (isNaN(displayOrder) || displayOrder < 1) {
      alert('❌ Display order must be a valid number');
      return;
    }
    
    if (editingItem) {
      putItem(route('questionnaire.items.update', editingItem.id), {
        onSuccess: () => {
          setShowItemModal(false);
          resetItem();
          setEditingItem(null);
        }
      });
    } else {
      postItem(route('questionnaire.items.store'), {
        onSuccess: () => {
          setShowItemModal(false);
          resetItem();
        }
      });
    }
  };

  const handleDeleteItem = (item: QuestionnaireItem) => {
    setItemToDelete(item);
  };

  const handleDeleteCategory = (category: QuestionnaireCategory) => {
    setCategoryToDelete(category);
  };

  const handleDeleteInterpretation = (interpretation: ScoreInterpretation) => {
    setInterpretationToDelete(interpretation);
  };

  const handleAddInterpretation = () => {
    resetInterpretation();
    setEditingInterpretation(null);
    setShowInterpretationModal(true);
  };

  const handleEditInterpretation = (interpretation: ScoreInterpretation) => {
    setEditingInterpretation(interpretation);
    setInterpretationData({
      score_min: interpretation.score_min.toString(),
      score_max: interpretation.score_max.toString(),
      interpretation: interpretation.interpretation,
      description: interpretation.description,
    });
    setShowInterpretationModal(true);
  };

  const handleInterpretationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!interpretationData.interpretation.trim()) {
      alert('❌ Interpretation label is required');
      return;
    }
    
    if (!interpretationData.description.trim()) {
      alert('❌ Description is required');
      return;
    }
    
    // Validate score ranges
    const minScore = parseFloat(interpretationData.score_min);
    const maxScore = parseFloat(interpretationData.score_max);
    
    if (isNaN(minScore) || isNaN(maxScore)) {
      alert('❌ Score ranges must be valid numbers');
      return;
    }
    
    if (minScore > maxScore) {
      alert('❌ Minimum score cannot be greater than maximum score');
      return;
    }
    
    if (minScore === maxScore && minScore > 0) {
      alert('⚠️ Warning: Min and Max scores are the same. This interpretation will only apply to a single score value.');
    }
    
    if (editingInterpretation) {
      putInterpretation(route('questionnaire.interpretations.update', editingInterpretation.id), {
        onSuccess: () => {
          setShowInterpretationModal(false);
          resetInterpretation();
          setEditingInterpretation(null);
        }
      });
    } else {
      postInterpretation(route('questionnaire.interpretations.store'), {
        onSuccess: () => {
          setShowInterpretationModal(false);
          resetInterpretation();
        }
      });
    }
  };

  const getTotalQuestions = () => {
    if (!categories || !Array.isArray(categories)) return 0;
    return categories.reduce((total, category) => {
      return total + (category.items ? category.items.length : 0);
    }, 0);
  };

  const getTotalMaxScore = () => {
    if (!categories || !Array.isArray(categories)) return 0;
    try {
      let total = 0;
      categories.forEach(category => {
        if (category && category.is_active) {
          const categoryMaxScore = parseFloat(String(category.max_score || '0'));
          if (!isNaN(categoryMaxScore)) {
            total += categoryMaxScore;
          }
        }
      });
      return Math.round(total * 100) / 100;
    } catch (error) {
      console.error('Error in getTotalMaxScore:', error);
      return 0;
    }
  };

  const getSafeMaxScore = () => {
    const score = getTotalMaxScore();
    return typeof score === 'number' && !isNaN(score) ? score : 0;
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const generateEqualScoreOptions = (maxScore: number, numOptions: number = 3) => {
    if (numOptions < 2) return '0,' + maxScore;
    const step = maxScore / (numOptions - 1);
    const options = [];
    for (let i = 0; i < numOptions; i++) {
      const value = step * i;
      options.push(value.toString());
    }
    return options.join(',');
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Questionnaire', href: route('questionnaire.index') },
      ]}
    >
      <Head title="Manage Questionnaire" />
      
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8
          ">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage Questionnaire
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Configure evaluation criteria, categories, questions, and score interpretations
              </p>
            </div>
          </div> 

          {/* Success/Error Messages */}
          {flash?.success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 rounded-r-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-green-800 dark:text-green-300 font-medium">{flash.success}</span>
            </div>
          )}
          {flash?.error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-red-800 dark:text-red-300 font-medium">{flash.error}</span>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Version</p>
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{settings.version}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Total Questions</p>
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{getTotalQuestions()}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Max Score</p>
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{getSafeMaxScore().toFixed(2)}</p>
            </div>
          </div>

          {/* Tab Navigation - Improved Design */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-all ${
                  activeTab === 'settings'
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 border-b-2 border-transparent'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('interpretations')}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-all ${
                  activeTab === 'interpretations'
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 border-b-2 border-transparent'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Interpretations <span className="ml-2 bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full text-xs font-semibold">{interpretations.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('categories-questions')}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-all ${
                  activeTab === 'categories-questions'
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 border-b-2 border-transparent'
                }`}
              >
                <Layers className="w-4 h-4 inline mr-2" />
                Categories & Questions
              </button>
            </nav>
          </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-8">
              <div className="max-w-6xl mx-auto">
                {/* Active Version Banner */}
                {versions && versions.length > 0 && (
                  <div className="mb-6 p-4 rounded-lg border bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
                    <p className={combineTheme('font-semibold text-lg', 'text-green-900 dark:text-green-200')}>
                      Active Version: {versions.find(v => v.is_active)?.version_number || 'N/A'}
                    </p>
                    <p className={combineTheme('text-sm mt-1', 'text-green-700 dark:text-green-300')}>
                      All new evaluations will use this version. Changing these settings will create a new version.
                    </p>
                  </div>
                )}

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Questionnaire Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Configure version and passing score threshold</p>
                </div>
                
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Version <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={data.version}
                        onChange={(e) => setData('version', e.target.value)}
                        placeholder="1.0"
                        pattern="^\d+\.\d+$"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      {errors.version && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.version}</p>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Format: X.Y (e.g., 1.0, 2.1)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Passing Score <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="999.99"
                        value={data.passing_score}
                        onChange={(e) => setData('passing_score', e.target.value)}
                        placeholder="10.50"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      {errors.passing_score && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.passing_score}</p>
                      )}
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Minimum score to pass evaluation</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                      <strong>Current Configuration:</strong> Maximum possible score is <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{getSafeMaxScore().toFixed(2)}</span> from {getTotalQuestions()} questions across {categories.length} categories.
                    </p>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="submit"
                      disabled={processing}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      {processing ? 'Updating...' : <>
                        <CheckCircle2 className="w-4 h-4" />
                        Update Settings
                      </>}
                    </button>
                  </div>
                </form>
              </div>

              {/* Version History Section */}
              <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-12">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Questionnaire Version History
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Track all changes to your questionnaire and compare versions</p>
                </div>

                {/* Version History Tab Content */}
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Total Versions</p>
                          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{versions.length}</p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Active Version</p>
                          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">v{versions.find(v => v.is_active)?.version_number || 'N/A'}</p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Active Uses</p>
                          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{versions.find(v => v.is_active)?.evaluation_count || 0}</p>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold uppercase tracking-wide">Questions</p>
                          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{categories.reduce((sum: number, cat: any) => sum + (cat.items?.length || 0), 0)}</p>
                      </div>
                    </div>

                    {/* Versions Timeline */}
                    <div className={combineTheme('rounded-lg shadow overflow-hidden', themeClasses.card.base)}>
                      <div className={combineTheme('px-6 py-4 border-b font-semibold', themeClasses.table.header)}>
                        Version Timeline
                      </div>

                      <div className={combineTheme('divide-y', themeClasses.table.border)}>
                        {versions.length === 0 ? (
                          <div className={combineTheme('text-center py-12', themeClasses.text.tertiary)}>
                            <p>No versions yet. Create a version by updating settings.</p>
                          </div>
                        ) : (
                          versions.map((version, idx) => (
                            <div
                              key={version.id}
                              className={combineTheme(
                                'p-6 transition-colors',
                                idx === 0 ? 'bg-blue-50 dark:bg-blue-950' : ''
                              )}
                            >
                              {/* Main Row */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className={combineTheme('text-lg font-semibold', themeClasses.text.primary)}>
                                      Version {version.version_number}
                                    </h3>
                                    <div className="flex gap-2">
                                      {version.is_active && (
                                        <span className={combineTheme(
                                          'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                        )}>
                                          ✓ Active
                                        </span>
                                      )}
                                      {version.status === 'archived' && (
                                        <span className={combineTheme(
                                          'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                                        )}>
                                          Archived
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {version.description && (
                                    <p className={combineTheme('text-sm', themeClasses.text.secondary)}>
                                      {version.description}
                                    </p>
                                  )}

                                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                    <div>
                                      <p className={combineTheme('font-medium', themeClasses.text.tertiary)}>
                                        Created
                                      </p>
                                      <p className={combineTheme('text-xs', themeClasses.text.primary)}>
                                        {new Date(version.created_at).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className={combineTheme('font-medium', themeClasses.text.tertiary)}>
                                        Categories
                                      </p>
                                      <p className={combineTheme('text-xs font-bold', 'text-blue-600 dark:text-blue-400')}>
                                        {version.snapshot.categories.length}
                                      </p>
                                    </div>
                                    <div>
                                      <p className={combineTheme('font-medium', themeClasses.text.tertiary)}>
                                        Questions
                                      </p>
                                      <p className={combineTheme('text-xs font-bold', 'text-blue-600 dark:text-blue-400')}>
                                        {version.snapshot.questions?.length || version.snapshot.question_count || 0}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setSelectedVersion(selectedVersion?.id === version.id ? null : version)}
                                    className={combineTheme(
                                      'px-3 py-1 rounded text-sm font-medium',
                                      'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300'
                                    )}
                                  >
                                    {selectedVersion?.id === version.id ? 'Hide' : 'View'}
                                  </button>
                                </div>
                              </div>

                              {/* Selected Version Detail */}
                              {selectedVersion?.id === version.id && (
                                <div className={combineTheme(
                                  'mt-4 pt-4 border-t',
                                  themeClasses.table.border
                                )}>
                                  <VersionInfo
                                    version={version}
                                    showEvaluationCount={true}
                                  />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
              </div>
            </div>
          )}

          {/* Interpretations Tab */}
          {activeTab === 'interpretations' && (
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Score Interpretations
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Define how different score ranges should be interpreted</p>
                </div>
                <button 
                  onClick={handleAddInterpretation}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Interpretation
                </button>
              </div>

              <div className="space-y-4">
                {interpretations.map((interpretation) => (
                  <div key={interpretation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm px-4 py-1.5 rounded-full font-bold">
                            {interpretation.score_min.toFixed(2)} – {interpretation.score_max.toFixed(2)}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{interpretation.interpretation}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{interpretation.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">v{interpretation.version}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditInterpretation(interpretation)}
                          className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteInterpretation(interpretation)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {interpretations.length === 0 && (
                  <div className="text-center py-12">
                    <Zap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">No score interpretations yet</p>
                    <button
                      onClick={handleAddInterpretation}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create your first interpretation
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories & Questions Tab */}
          {activeTab === 'categories-questions' && (
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    Categories & Questions
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Organize evaluation questions into categories</p>
                </div>
                <button 
                  onClick={handleAddCategory}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-16">
                  <Layers className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Categories Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Start by creating a category to organize your evaluation questions.</p>
                  <button 
                    onClick={handleAddCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold inline-flex items-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Category
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {categories.map((category) => {
                    const isExpanded = expandedCategories.has(category.id);
                    return (
                      <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                        <button
                          onClick={() => toggleCategoryExpansion(category.id)}
                          className={`w-full px-6 py-4 text-left transition-colors ${
                            category.is_active 
                              ? 'bg-blue-50 dark:bg-blue-900/20' 
                              : 'bg-gray-50 dark:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 flex items-center gap-3">
                              {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{category.category_name}</h3>
                                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                    category.is_active 
                                      ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                                      : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                                  }`}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                {category.description && (
                                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{category.description}</p>
                                )}
                                <div className="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                  <span>Max Score: <strong>{parseFloat(String(category.max_score || '0')).toFixed(2)}</strong></span>
                                  <span>Questions: <strong>{category.items.length}</strong></span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex gap-2 mb-6">
                              <button 
                                onClick={() => handleAddItemToCategory(category.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Question
                              </button>
                              <button 
                                onClick={() => handleEditCategory(category)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(category)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                              {/* ALWAYS show button for testing */}
                              {/* Redistribute button removed - scoring is now automatic */}
                            </div>

                            {/* Redistribute message removed - scoring is now always automatic */}

                            {category.items.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-gray-300 dark:border-gray-600">
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">No.</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Question</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Score Options</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {category.items
                                      .sort((a, b) => a.display_order - b.display_order)
                                      .map((item) => (
                                        <tr key={item.id} className="border-b border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-600/30 transition">
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                                              {category.display_order}.{item.display_order}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900 dark:text-white max-w-xs">{item.question}</div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{item.score_options}</div>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                              item.is_active 
                                                ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                                            }`}>
                                              {item.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                              <button 
                                                onClick={() => handleEditItem(item)}
                                                className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                                              >
                                                <Edit2 className="w-4 h-4" />
                                              </button>
                                              <button 
                                                onClick={() => handleDeleteItem(item)}
                                                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-gray-600 dark:text-gray-400">No questions added yet</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Modals and Dialogs */}
      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            deleteItem(route('questionnaire.items.destroy', itemToDelete.id), { method: 'delete' });
            setItemToDelete(null);
          }
        }}
        title="Delete Question"
        description={`Are you sure you want to delete this question? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={!!interpretationToDelete}
        onClose={() => setInterpretationToDelete(null)}
        onConfirm={() => {
          if (interpretationToDelete) {
            deleteInterpretation(route('questionnaire.interpretations.destroy', interpretationToDelete.id), { method: 'delete' });
            setInterpretationToDelete(null);
          }
        }}
        title="Delete Interpretation"
        description={`Are you sure you want to delete this score interpretation? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory(route('questionnaire.categories.destroy', categoryToDelete.id), { method: 'delete' });
            setCategoryToDelete(null);
          }
        }}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${categoryToDelete?.category_name}"? This action cannot be undone and will delete all associated questions.`}
      />

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 w-full max-w-lg shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h3>
            <form onSubmit={handleCategorySubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryData.category_name}
                  onChange={(e) => setCategoryData('category_name', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={categoryData.description}
                  onChange={(e) => setCategoryData('description', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Max Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="999.99"
                    value={categoryData.max_score}
                    onChange={(e) => setCategoryData('max_score', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Display Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={categoryData.display_order}
                    onChange={(e) => setCategoryData('display_order', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Equal distribution checkbox removed - now always automatic */}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryProcessing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  {categoryProcessing ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item/Question Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 w-full max-w-lg max-h-96 overflow-y-auto shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Edit2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {editingItem ? 'Edit Question' : 'New Question'}
            </h3>
            <form onSubmit={handleItemSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={itemData.category_id}
                  onChange={(e) => {
                    setItemData('category_id', e.target.value);
                    setSelectedCategoryForQuestion(parseInt(e.target.value));
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={itemData.question}
                  onChange={(e) => setItemData('question', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Score Options <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemData.score_options}
                  onChange={(e) => setItemData('score_options', e.target.value)}
                  placeholder="e.g., 0,1,2,3"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                  required
                  disabled
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-generated based on category and question count</p>
              </div>

              {/* Auto-distribution checkbox removed - now always automatic */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Display Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={itemData.display_order}
                    onChange={(e) => setItemData('display_order', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 p-2 rounded-lg">
                    <input
                      type="checkbox"
                      checked={itemData.is_active}
                      onChange={(e) => setItemData('is_active', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={itemProcessing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  {itemProcessing ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interpretation Modal */}
      {showInterpretationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 w-full max-w-lg shadow-xl">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {editingInterpretation ? 'Edit Interpretation' : 'New Interpretation'}
            </h3>
            <form onSubmit={handleInterpretationSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Min Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="999.99"
                    value={interpretationData.score_min}
                    onChange={(e) => setInterpretationData('score_min', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Max Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="999.99"
                    value={interpretationData.score_max}
                    onChange={(e) => setInterpretationData('score_max', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={interpretationData.interpretation}
                  onChange={(e) => setInterpretationData('interpretation', e.target.value)}
                  placeholder="e.g., GAD is invisible"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={interpretationData.description}
                  onChange={(e) => setInterpretationData('description', e.target.value)}
                  placeholder="e.g., Project is returned"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  rows={3}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInterpretationModal(false)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={interpretationProcessing}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  {interpretationProcessing ? 'Saving...' : (editingInterpretation ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

