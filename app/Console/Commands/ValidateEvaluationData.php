<?php

namespace App\Console\Commands;

use App\Models\Evaluation;
use App\Models\EvaluationScore;
use App\Models\QuestionnaireVersion;
use App\Services\EvaluationSubtotalService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * ValidateEvaluationData Command
 * 
 * Validates data integrity across evaluations, scores, versions, and subtotals.
 * Can automatically fix discovered issues with the --fix flag.
 * 
 * Usage:
 *   php artisan evaluation:validate                      # Report only
 *   php artisan evaluation:validate --fix                # Report and fix
 *   php artisan evaluation:validate --version=1          # Check specific version
 * 
 * Validates:
 * 1. Version snapshot integrity (no corrupted/empty snapshots)
 * 2. Orphaned scores (scores with invalid item IDs)
 * 3. Total score mismatches (calculated ≠ stored)
 * 4. Status inconsistencies (completed without completion_date)
 * 5. Subtotal calculations (per-category scores are correct)
 */
class ValidateEvaluationData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'evaluation:validate {--fix} {--version=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Validate and repair evaluation data integrity';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Starting evaluation data validation...');
        $this->newLine();

        $fix = $this->option('fix');
        $versionFilter = $this->option('version');

        $issues = [
            'missing_snapshots' => 0,
            'empty_snapshots' => 0,
            'orphaned_scores' => 0,
            'total_mismatch' => 0,
            'status_inconsistent' => 0,
            'missing_subtotals' => 0,
            'subtotal_mismatch' => 0,
        ];

        // ====== CHECK 1: Version Snapshots ======
        $this->line('📋 <fg=cyan>Check 1: Version Snapshots</fg=cyan>');
        $versions = QuestionnaireVersion::query();
        if ($versionFilter) {
            $versions->where('id', $versionFilter);
        }
        $versions = $versions->get();

        foreach ($versions as $version) {
            if (!$version->snapshot) {
                $this->warn("  ⚠️  Version {$version->id} has no snapshot data");
                $issues['missing_snapshots']++;
            } elseif (empty($version->snapshot['questions']) && empty($version->snapshot['categories'])) {
                $this->warn("  ⚠️  Version {$version->id} has empty snapshot");
                $issues['empty_snapshots']++;
            }
        }
        $this->line("  ✓ Checked {$versions->count()} versions");
        $this->newLine();

        // ====== CHECK 2: Orphaned Scores ======
        $this->line('📊 <fg=cyan>Check 2: Orphaned Scores</fg=cyan>');
        $evaluations = Evaluation::query();
        if ($versionFilter) {
            $evaluations->where('questionnaire_version_id', $versionFilter);
        }
        $evaluations = $evaluations->with('questionnaireVersion', 'scores')->get();

        foreach ($evaluations as $eval) {
            if (!$eval->questionnaireVersion) {
                $this->warn("  ⚠️  Evaluation {$eval->id} has no version");
                continue;
            }

            $version = $eval->questionnaireVersion;
            $questions = $version->snapshot['questions'] ?? [];
            $validItemIds = collect($questions)->pluck('id')->toArray();

            $orphaned = $eval->scores()
                ->whereNotIn('questionnaire_item_id', $validItemIds)
                ->get();

            if ($orphaned->isNotEmpty()) {
                $this->warn("  ⚠️  Evaluation {$eval->id} has {$orphaned->count()} orphaned scores");
                $issues['orphaned_scores'] += $orphaned->count();

                if ($fix) {
                    $eval->scores()->whereNotIn('questionnaire_item_id', $validItemIds)->delete();
                    $this->line("     ✓ Deleted orphaned scores");
                }
            }
        }
        $this->line("  ✓ Checked {$evaluations->count()} evaluations for orphaned scores");
        $this->newLine();

        // ====== CHECK 3: Total Score Mismatches ======
        $this->line('💯 <fg=cyan>Check 3: Total Score Mismatches</fg=cyan>');
        foreach ($evaluations as $eval) {
            $calculated = floatval($eval->scores()->sum('score') ?? 0);
            $stored = floatval($eval->total_score ?? 0);

            if (abs($calculated - $stored) > 0.01) {
                $this->warn("  ⚠️  Evaluation {$eval->id}: calc={$calculated}, stored={$stored}");
                $issues['total_mismatch']++;

                if ($fix) {
                    $eval->update(['total_score' => $calculated]);
                    $this->line("     ✓ Updated total_score to {$calculated}");
                }
            }
        }
        $this->line("  ✓ Checked {$evaluations->count()} evaluations for score mismatches");
        $this->newLine();

        // ====== CHECK 4: Status Inconsistencies ======
        $this->line('📌 <fg=cyan>Check 4: Status Inconsistencies</fg=cyan>');
        $completedWithoutDate = Evaluation::query()
            ->where('status_id', 2)
            ->whereNull('completion_date')
            ->count();

        if ($completedWithoutDate > 0) {
            $this->warn("  ⚠️  {$completedWithoutDate} evaluations marked completed without completion_date");
            $issues['status_inconsistent'] += $completedWithoutDate;

            if ($fix) {
                $fixed = Evaluation::where('status_id', 2)
                    ->whereNull('completion_date')
                    ->update(['completion_date' => DB::raw('updated_at')]);
                $this->line("     ✓ Set completion_date for {$fixed} evaluations");
            }
        }
        $this->line("  ✓ Status consistency check complete");
        $this->newLine();

        // ====== CHECK 5: Subtotal Calculations ======
        $this->line('📈 <fg=cyan>Check 5: Subtotal Calculations</fg=cyan>');
        $subtotalIssues = 0;

        foreach ($evaluations as $eval) {
            $validation = EvaluationSubtotalService::validateSubtotals($eval);

            if (!$validation['valid']) {
                $subtotalIssues += $validation['discrepancy_count'];
                $this->warn("  ⚠️  Evaluation {$eval->id} has {$validation['discrepancy_count']} subtotal issues");

                if ($fix) {
                    $result = EvaluationSubtotalService::calculateAndStore($eval);
                    if ($result['success']) {
                        $this->line("     ✓ Recalculated subtotals");
                    }
                }
            }
        }

        $issues['missing_subtotals'] = $subtotalIssues > 0 ? $subtotalIssues : 0;
        $this->line("  ✓ Checked {$evaluations->count()} evaluations for subtotal accuracy");
        $this->newLine();

        // ====== SUMMARY ======
        $this->line('<fg=yellow>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</fg=yellow>');
        $this->line('📊 <fg=yellow>VALIDATION SUMMARY</fg=yellow>');
        $this->line('<fg=yellow>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</fg=yellow>');
        $this->newLine();

        $totalIssues = array_sum($issues);

        foreach ($issues as $type => $count) {
            $label = str_replace('_', ' ', ucfirst($type));
            $icon = $count > 0 ? '⚠️ ' : '✓';
            $color = $count > 0 ? 'red' : 'green';
            $this->line("  {$icon} <fg={$color}>{$label}: {$count}</fg={$color}>");
        }

        $this->newLine();
        $this->line("<fg=yellow>Total Issues Found: {$totalIssues}</fg=yellow>");
        $this->newLine();

        if ($fix) {
            $this->info('✓ Auto-repair completed where possible');
            Log::info('Evaluation data auto-repair completed', ['issues_found' => $issues]);
        } else {
            if ($totalIssues > 0) {
                $this->info('💡 Run with <fg=cyan>--fix</fg=cyan> flag to automatically repair issues');
            }
            Log::info('Evaluation data validation completed', ['issues_found' => $issues]);
        }

        return $totalIssues > 0 && !$fix ? 1 : 0;
    }
}
