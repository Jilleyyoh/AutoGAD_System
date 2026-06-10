<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
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
            'dev_reset_url' => $request->session()->get('dev_reset_url'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'This email is not registered in the system. Please contact your administrator.',
            ]);
        }

        if (app()->environment('local')) {
            // Skip sending email entirely in local — just generate the token directly
            $token = app('auth.password.broker')->createToken($user);

            $resetUrl = url(route('password.reset', [
                'token' => $token,
                'email' => $request->email,
            ], false));

            return back()->with('dev_reset_url', $resetUrl);
        }

        // Production: send the actual reset email
        Password::sendResetLink($request->only('email'));

        return back()->with('status', __('Password reset link sent! Please check your email.'));
    }
}
