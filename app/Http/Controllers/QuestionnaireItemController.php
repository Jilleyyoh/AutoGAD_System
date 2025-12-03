<?php

namespace App\Http\Controllers;

use App\Models\QuestionnaireItem;
use App\Models\QuestionnaireCategory;
use App\Models\QuestionnaireSetting;
use App\Services\ScoreDistributionService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class QuestionnaireItemController extends Controller
{
    /**
     * Distribute category max score evenly among questions
     */
    private function distributeScoreAmongQuestions($categoryId)
    {
        $category = QuestionnaireCategory::findOrFail($categoryId);
        $questions = QuestionnaireItem::where('category_id', $categoryId)->get();
        
        if ($questions->count() > 0) {
            $scorePerQuestion = round($category->max_score / $questions->count(), 2);
            
            foreach ($questions as $question) {
                $question->update(['max_score' => $scorePerQuestion]);
            }
        }
    }

    /**
     * Generate item number based on category and display order
     */
    private function generateItemNumber($categoryId, $displayOrder)
    {
        $category = QuestionnaireCategory::findOrFail($categoryId);
        return $category->display_order . '.' . $displayOrder;
    }

    /**
     * Shift display orders to make room for new item
     */
    private function shiftDisplayOrders($categoryId, $newDisplayOrder)
    {
        // Get all items in category with display order >= new order
        $itemsToShift = QuestionnaireItem::where('category_id', $categoryId)
            ->where('display_order', '>=', $newDisplayOrder)
            ->orderBy('display_order', 'desc')
            ->get();

        // Shift each item's display order up by 1
        foreach ($itemsToShift as $item) {
            $item->update(['display_order' => $item->display_order + 1]);
        }
    }

    /**
     * Regenerate all item numbers for a category to ensure consistency
     */
    private function regenerateItemNumbers($categoryId)
    {
        $category = QuestionnaireCategory::findOrFail($categoryId);
        $items = QuestionnaireItem::where('category_id', $categoryId)
            ->orderBy('display_order')
            ->get();

        foreach ($items as $item) {
            $newItemNumber = $category->display_order . '.' . $item->display_order;
            $item->update(['item_number' => $newItemNumber]);
        }
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:questionnaire_categories,id',
            'question' => 'required|string|max:1000',
            'score_options' => 'nullable|string|max:255',
            'display_order' => 'required|integer|min:1|max:100',
        ]);

        // Get current version
        $currentVersion = QuestionnaireSetting::getValue('questionnaire_version', '1.0');
        
        // Get category
        $category = QuestionnaireCategory::findOrFail($request->category_id);
        
        // Shift existing items if necessary
        $this->shiftDisplayOrders($request->category_id, $request->display_order);
        
        // Generate item number
        $itemNumber = $this->generateItemNumber($request->category_id, $request->display_order);
        
        // Determine score_options and max_score
        $scoreOptions = $request->score_options ?? '0,0.5,1.0';
        $maxScore = 1.00; // Default

        QuestionnaireItem::create([
            'category_id' => $request->category_id,
            'item_number' => $itemNumber,
            'question' => $request->question,
            'score_options' => $scoreOptions,
            'max_score' => $maxScore,
            'display_order' => $request->display_order,
            'is_active' => true,
            'version' => $currentVersion,
        ]);

        // AUTOMATIC: Always recalculate - check and recalculate if needed
        \App\Services\ScoreDistributionService::checkAndRecalculateIfNeeded($request->category_id);

        return redirect()->route('questionnaire.index')
            ->with('success', 'Question created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, QuestionnaireItem $item)
    {
        $request->validate([
            'category_id' => 'required|exists:questionnaire_categories,id',
            'question' => 'required|string|max:1000',
            'score_options' => 'nullable|string|max:255',
            'display_order' => 'required|integer|min:1|max:100',
            'is_active' => 'boolean',
        ]);

        $oldCategoryId = $item->category_id;
        $newCategoryId = $request->category_id;
        $oldDisplayOrder = $item->display_order;
        $newDisplayOrder = $request->display_order;

        // Get current version
        $currentVersion = QuestionnaireSetting::getValue('questionnaire_version', '1.0');

        // If category changed, handle movement between categories
        if ($oldCategoryId != $newCategoryId) {
            // Remove from old category (close gaps)
            QuestionnaireItem::where('category_id', $oldCategoryId)
                ->where('display_order', '>', $oldDisplayOrder)
                ->decrement('display_order');

            // Make room in new category
            $this->shiftDisplayOrders($newCategoryId, $newDisplayOrder);
        } else if ($oldDisplayOrder != $newDisplayOrder) {
            // Same category but different position
            if ($newDisplayOrder < $oldDisplayOrder) {
                // Moving up - shift items down
                QuestionnaireItem::where('category_id', $newCategoryId)
                    ->where('display_order', '>=', $newDisplayOrder)
                    ->where('display_order', '<', $oldDisplayOrder)
                    ->increment('display_order');
            } else {
                // Moving down - shift items up
                QuestionnaireItem::where('category_id', $newCategoryId)
                    ->where('display_order', '>', $oldDisplayOrder)
                    ->where('display_order', '<=', $newDisplayOrder)
                    ->decrement('display_order');
            }
        }

        // Generate new item number
        $itemNumber = $this->generateItemNumber($newCategoryId, $newDisplayOrder);

        $item->update([
            'category_id' => $newCategoryId,
            'item_number' => $itemNumber,
            'question' => $request->question,
            'score_options' => $request->score_options,
            'display_order' => $newDisplayOrder,
            'is_active' => $request->boolean('is_active', true),
            'version' => $currentVersion,
        ]);

        // Regenerate item numbers for affected categories to ensure consistency
        $this->regenerateItemNumbers($newCategoryId);
        if ($oldCategoryId != $newCategoryId) {
            $this->regenerateItemNumbers($oldCategoryId);
        }
        
        // AUTOMATIC: Always recalculate both categories if affected
        \App\Services\ScoreDistributionService::checkAndRecalculateIfNeeded($newCategoryId);
        if ($oldCategoryId != $newCategoryId) {
            \App\Services\ScoreDistributionService::checkAndRecalculateIfNeeded($oldCategoryId);
        }

        return redirect()->route('questionnaire.index')
            ->with('success', 'Question updated successfully.');
    }

    /**
     * Update only the status of the specified resource.
     */
    public function updateStatus(Request $request, QuestionnaireItem $item)
    {
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $categoryId = $item->category_id;
        
        $item->update([
            'is_active' => $request->boolean('is_active'),
        ]);
        
        // AUTOMATIC: Always recalculate when status changes
        \App\Services\ScoreDistributionService::checkAndRecalculateIfNeeded($categoryId);

        return response()->json([
            'success' => true,
            'message' => 'Question status updated successfully.',
            'item' => $item->fresh(), // Return updated item
        ]);
    }

        /**
     * Remove the specified resource from storage.
     */
    public function destroy(QuestionnaireItem $item)
    {
        $categoryId = $item->category_id;
        $displayOrder = $item->display_order;

        // Close gap in display_order
        QuestionnaireItem::where('category_id', $categoryId)
            ->where('display_order', '>', $displayOrder)
            ->decrement('display_order');

        // Delete the item
        $item->delete();

        // Regenerate item numbers for the category
        $this->regenerateItemNumbers($categoryId);
        
        // AUTOMATIC: Always recalculate when question is deleted
        \App\Services\ScoreDistributionService::checkAndRecalculateIfNeeded($categoryId);

        return redirect()->route('questionnaire.index')
            ->with('success', 'Question deleted successfully.');
    }
}
