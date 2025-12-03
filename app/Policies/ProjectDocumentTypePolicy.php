<?php

namespace App\Policies;

use App\Models\ProjectDocumentType;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProjectDocumentTypePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ProjectDocumentType $projectDocumentType): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ProjectDocumentType $projectDocumentType): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ProjectDocumentType $projectDocumentType): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ProjectDocumentType $projectDocumentType): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ProjectDocumentType $projectDocumentType): bool
    {
        return false;
    }
}
