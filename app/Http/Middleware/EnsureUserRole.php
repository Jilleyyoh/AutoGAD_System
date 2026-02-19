<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        
        // Guard rails: redirect user back to their allowed namespace root if strays.
        if ($user->role_id === 1 && !str_starts_with($request->path(), 'proponent')) {
            return redirect()->route('proponent.dashboard');
            
        }
        if ($user->role_id === 3 && !str_starts_with($request->path(), 'admin1')) {
            return redirect()->route('admin1.dashboard');
        }
        if ($user->role_id === 4 && !str_starts_with($request->path(), 'admin2')) {
            return redirect()->route('admin2.dashboard');
        }

        return $next($request);
    }
}