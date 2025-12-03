<?php

namespace App\Http\Controllers;

use App\Models\QuestionnaireVersion;
use App\Services\QuestionnaireVersionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QuestionnaireVersionController extends Controller
{
    /**
     * Display all questionnaire versions
     */
    public function index()
    {
        $versions = QuestionnaireVersionService::getAllVersions();
        
        return response()->json([
            'versions' => $versions,
            'active_version' => QuestionnaireVersionService::getActiveVersion(),
        ]);
    }

    /**
     * Create a new questionnaire version
     */
    public function store(Request $request)
    {
        $request->validate([
            'version_number' => 'required|string|unique:questionnaire_versions,version_number',
            'description' => 'nullable|string|max:1000',
            'passing_score' => 'required|numeric|min:0',
        ]);

        try {
            $version = QuestionnaireVersionService::createVersion(
                $request->version_number,
                $request->description,
                (int)$request->passing_score
            );

            Log::info('Questionnaire version created', [
                'version_id' => $version->id,
                'version_number' => $version->version_number,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Version {$version->version_number} created successfully",
                'version' => $version,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create questionnaire version', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create version: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get specific version details
     */
    public function show(QuestionnaireVersion $version)
    {
        return response()->json([
            'version' => $version,
            'categories' => $version->getCategories(),
            'questions' => $version->getQuestions(),
            'evaluation_count' => $version->evaluationCount(),
            'is_locked' => $version->isLocked(),
        ]);
    }

    /**
     * Archive a questionnaire version
     */
    public function archive(QuestionnaireVersion $version)
    {
        if ($version->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot archive the active version. Create a new version first.',
            ], 400);
        }

        try {
            $version->archive();

            Log::info('Questionnaire version archived', [
                'version_id' => $version->id,
                'version_number' => $version->version_number,
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Version {$version->version_number} archived successfully",
                'version' => $version,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to archive questionnaire version', [
                'version_id' => $version->id,
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to archive version: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Compare two versions
     */
    public function compare(Request $request)
    {
        $request->validate([
            'version_1_id' => 'required|exists:questionnaire_versions,id',
            'version_2_id' => 'required|exists:questionnaire_versions,id',
        ]);

        $comparison = QuestionnaireVersionService::compareVersions(
            $request->version_1_id,
            $request->version_2_id
        );

        return response()->json([
            'comparison' => $comparison,
        ]);
    }

    /**
     * Get snapshot for a version
     */
    public function snapshot(QuestionnaireVersion $version)
    {
        return response()->json([
            'version' => $version->version_number,
            'created_at' => $version->created_at,
            'snapshot' => $version->snapshot,
        ]);
    }
}
