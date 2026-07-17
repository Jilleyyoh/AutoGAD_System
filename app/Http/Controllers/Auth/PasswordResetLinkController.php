<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TemporaryPasswordGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset request via email and birthdate verification.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request, TemporaryPasswordGenerator $temporaryPasswordGenerator): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'birthdate' => 'required|date_format:Y-m-d',
        ]);

        // Convert the request birthdate to match the database format
        $user = User::where('email', $request->email)
            ->whereDate('birthdate', $request->birthdate)
            ->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'Email and birthdate do not match any registered account.',
            ]);
        }

        $temporaryPassword = $temporaryPasswordGenerator->generate(10);
        $user->update([
            'password' => Hash::make($temporaryPassword),
            'must_change_password' => true,
        ]);

        return back()->with([
            'status' => 'Your password has been reset. Please use the temporary password below to log in.',
            'temporary_password' => $temporaryPassword,
        ]);
    }
}
