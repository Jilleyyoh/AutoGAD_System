<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            abort(403, 'Unauthorized access.');
        }

        // Load the role relationship if not loaded
        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }

        \Log::debug('Role Check', [
            'user_role_id' => $user->role_id,
            'user_role_name' => $user->role ? $user->role->name : null,
            'required_roles' => $roles,
            'request_path' => $request->path(),
            'request_method' => $request->method()
        ]);

        // Check both role ID and role name
        foreach ($roles as $role) {
            // Check if the role is a numeric ID
            if (is_numeric($role) && $user->role_id === (int)$role) {
                return $next($request);
            }
            
            // Check if the role matches the name (case-insensitive)
            if ($user->role && strtolower($user->role->name) === strtolower($role)) {
                return $next($request);
            }
        }

        \Log::info('Role Check Failed', [
            'user_role_id' => $user->role_id,
            'user_role_name' => $user->role->name,
            'required_roles' => $roles,
            'user' => $user->only(['id', 'name', 'email', 'role_id'])
        ]);

        // If no valid role match is found, abort with unauthorized
        abort(403, 'Unauthorized access.');

        return $next($request);
    }
}
