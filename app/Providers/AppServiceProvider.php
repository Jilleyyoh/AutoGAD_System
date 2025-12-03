<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\QuestionnaireCategory;
use App\Observers\QuestionnaireCategoryObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register observer for automatic equal distribution recalculation
        QuestionnaireCategory::observe(QuestionnaireCategoryObserver::class);
    }
}
