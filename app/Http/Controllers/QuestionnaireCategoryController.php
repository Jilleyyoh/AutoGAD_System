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
     * Shift display orders to make room for a new/moved category
     */
    private function shiftDisplayOrders($newDisplayOrder, $excludeCategoryId = null)
    {
        $query = QuestionnaireCategory::where('display_order', '>=', $newDisplayOrder)
            ->orderBy('display_order', 'desc');

        if ($excludeCategoryId) {
            $query->where('id', '!=', $excludeCategoryId);
        }

        $categoriesToShift = $query->get();

        foreach ($categoriesToShift as $category) {
            $category->update(['display_order' => $category->display_order + 1]);
        }
    }

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

        // Make room for the new category at this position
        $this->shiftDisplayOrders($request->display_order);

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

        $oldDisplayOrder = $category->display_order;
        $newDisplayOrder = $request->display_order;

        // Get current version
        $currentVersion = QuestionnaireSetting::getValue('questionnaire_version', '1.0');

        if ($oldDisplayOrder != $newDisplayOrder) {
            if ($newDisplayOrder < $oldDisplayOrder) {
                // Moving up - shift others down
                QuestionnaireCategory::where('id', '!=', $category->id)
                    ->where('display_order', '>=', $newDisplayOrder)
                    ->where('display_order', '<', $oldDisplayOrder)
                    ->increment('display_order');
            } else {
                // Moving down - shift others up
                QuestionnaireCategory::where('id', '!=', $category->id)
                    ->where('display_order', '>', $oldDisplayOrder)
                    ->where('display_order', '<=', $newDisplayOrder)
                    ->decrement('display_order');
            }
        }

        $category->update([
            'category_name' => $request->category_name,
            'description' => $request->description,
            'max_score' => $request->max_score,
            'display_order' => $newDisplayOrder,
            'is_active' => $request->boolean('is_active', true),
            'version' => $currentVersion,
        ]);

        return redirect()->route('questionnaire.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    /**
     * Remove the specified resource from storage.
     * 
     * If the category (or any of its questions) has evaluation history,
     * deactivate instead of hard-delete to preserve historical accuracy.
     */
    public function destroy(QuestionnaireCategory $category)
    {
        $displayOrder = $category->display_order;

        // Check if any question in this category has evaluation history
        $itemIds = QuestionnaireItem::where('category_id', $category->id)->pluck('id');
        $hasHistory = \App\Models\EvaluationScore::whereIn('questionnaire_item_id', $itemIds)->exists();

        if ($hasHistory) {
            // Deactivate category and all its items instead of deleting
            $category->update(['is_active' => false]);
            QuestionnaireItem::where('category_id', $category->id)->update(['is_active' => false]);

            // Close the gap for remaining ACTIVE categories
            QuestionnaireCategory::where('is_active', true)
                ->where('display_order', '>', $displayOrder)
                ->decrement('display_order');

            // Regenerate item numbers for all active categories, since their
            // display_order (used as the "X" in "X.Y" item numbers) may have shifted
            $this->regenerateAllItemNumbers();

            return redirect()->route('questionnaire.index')
                ->with('success', 'This category has questions used in past evaluations, so it was deactivated (hidden) instead of deleted, to preserve historical records.');
        }

        // Safe to hard-delete - no evaluation history exists for any question here
        QuestionnaireItem::where('category_id', $category->id)->delete();
        $category->delete();

        // Close the gap left behind
        QuestionnaireCategory::where('display_order', '>', $displayOrder)
            ->decrement('display_order');

        return redirect()->route('questionnaire.index')
            ->with('success', 'Category and all its questions deleted successfully.');
    }

    private function regenerateAllItemNumbers()
    {
        $categories = QuestionnaireCategory::where('is_active', true)->get();
        foreach ($categories as $category) {
            $items = QuestionnaireItem::where('category_id', $category->id)
                ->orderBy('display_order')
                ->get();
            foreach ($items as $item) {
                $newItemNumber = $category->display_order . '.' . $item->display_order;
                $item->update(['item_number' => $newItemNumber]);
            }
        }
    }
}