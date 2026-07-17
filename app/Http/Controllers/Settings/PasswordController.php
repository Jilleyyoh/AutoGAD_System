<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/password', [
            'mustChangePassword' => request()->user()?->must_change_password ?? false,
            'status' => request()->session()->get('status'),
        ]);
    }

    /**
     * Update the user's password.
     */
    public function update(Request $request): RedirectResponse
    {
        $mustChangePassword = (bool) $request->user()?->must_change_password;

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', PasswordRule::min(8)->mixedCase()->numbers()->symbols(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ]);

        if ($mustChangePassword) {
            return redirect()->route('dashboard')->with('status', 'Your password has been updated.');
        }

        return back()->with('status', 'Your password has been updated.');
    }
}
