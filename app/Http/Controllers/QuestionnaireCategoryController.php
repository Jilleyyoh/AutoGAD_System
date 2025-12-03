<?php

namespace App\Http\Controllers;

use App\Models\QuestionnaireCategory;
use App\Models\QuestionnaireSetting;
use App\Models\QuestionnaireItem;
use App\Services\ScoreDistributionService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class QuestionnaireCategoryController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_name' => 'required|string|max:255|unique:questionnaire_categories,category_name',
            'description' => 'nullable|string|max:1000',
            'max_score' => 'required|numeric|min:0|max:999.99',
            'display_order' => 'required|integer|min:1|max:100',
        ]);

        // Get current version
        $currentVersion = QuestionnaireSetting::getValue('questionnaire_version', '1.0');

        QuestionnaireCategory::create([
            'category_name' => $request->category_name,
            'description' => $request->description,
            'max_score' => $request->max_score,
            'display_order' => $request->display_order,
            'is_active' => true,
            'version' => $currentVersion,
        ]);

        return redirect()->route('questionnaire.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, QuestionnaireCategory $category)
    {
        $request->validate([
            'category_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('questionnaire_categories')->ignore($category->id),
            ],
            'description' => 'nullable|string|max:1000',
            'max_score' => 'required|numeric|min:0|max:999.99',
            'display_order' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
        ]);

        // Get current version
        $currentVersion = QuestionnaireSetting::getValue('questionnaire_version', '1.0');

        $category->update([
            'category_name' => $request->category_name,
            'description' => $request->description,
            'max_score' => $request->max_score,
            'display_order' => $request->display_order,
            'is_active' => $request->boolean('is_active', true),
            'version' => $currentVersion,
        ]);

        return redirect()->route('questionnaire.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(QuestionnaireCategory $category)
    {
        // Delete all questions in this category first
        QuestionnaireItem::where('category_id', $category->id)->delete();
        
        // Delete the category
        $category->delete();

        return redirect()->route('questionnaire.index')
            ->with('success', 'Category and all its questions deleted successfully.');
    }
}
