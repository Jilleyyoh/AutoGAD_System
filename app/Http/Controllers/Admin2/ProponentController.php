<?php

namespace App\Http\Controllers\Admin2;

use App\Models\Proponent;
use App\Models\User;
use App\Models\Role;
use App\Services\TemporaryPasswordGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProponentController
{
    public function index()
    {
        $proponents = Proponent::with(['user'])->paginate(15)->through(function ($proponent) {
            return [
                'id' => $proponent->id,
                'user_id' => $proponent->user_id,
                'organization' => $proponent->organization,
                'position' => $proponent->position,
                'contact_number' => $proponent->contact_number,
                'created_at' => $proponent->created_at,
                'updated_at' => $proponent->updated_at,
                'user' => $proponent->user ? [
                    'id' => $proponent->user->id,
                    'name' => $proponent->user->name,
                    'email' => $proponent->user->email,
                    'birthdate' => $proponent->user->birthdate,
                ] : null,
            ];
        });
        return Inertia::render('admin2/proponents/index', [
            'proponents' => $proponents
        ]);
    }

    public function create()
    {
        return Inertia::render('admin2/proponents/create');
    }

    public function store(Request $request, TemporaryPasswordGenerator $temporaryPasswordGenerator)
    {
        $request->merge([
            'contact_number' => $this->normalizePhilippineContactNumber($request->contact_number ?? ''),
        ]);

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'birthdate' => 'required|date_format:Y-m-d',
            'organization' => 'required|string|max:150',
            'position' => 'nullable|string|max:100',
            'contact_number' => ['required', 'string', 'size:11', 'regex:/^09\d{9}$/'],
        ]);

        // Get proponent role (role_id = 1)
        $role = Role::where('name', 'proponent')->firstOrFail();

        $temporaryPassword = $temporaryPasswordGenerator->generate(10);

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'birthdate' => $request->birthdate,
            'password' => Hash::make($temporaryPassword),
            'role_id' => $role->id,
            'must_change_password' => true,
        ]);

        // Create proponent profile
        Proponent::create([
            'user_id' => $user->id,
            'organization' => $request->organization,
            'position' => $request->position,
            'contact_number' => $this->normalizePhilippineContactNumber($request->contact_number),
        ]);

        return redirect()->route('admin2.proponents.create')->with([
            'success' => 'Proponent created successfully. Share the temporary password below with the user, then ask them to change it after first login.',
            'temporary_password' => $temporaryPassword,
        ]);
    }

    public function edit(Proponent $proponent)
    {
        return Inertia::render('admin2/proponents/edit', [
            'proponent' => $proponent->load('user')
        ]);
    }

    public function update(Request $request, Proponent $proponent)
    {
        $request->merge([
            'contact_number' => $this->normalizePhilippineContactNumber($request->contact_number ?? ''),
        ]);

        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $proponent->user_id,
            'birthdate' => 'required|date_format:Y-m-d',
            'organization' => 'required|string|max:150',
            'position' => 'nullable|string|max:100',
            'contact_number' => ['required', 'string', 'size:11', 'regex:/^09\d{9}$/'],
        ]);

        // Update user
        $proponent->user->update([
            'name' => $request->name,
            'email' => $request->email,
            'birthdate' => $request->birthdate,
        ]);

        // Update proponent profile
        $proponent->update([
            'organization' => $request->organization,
            'position' => $request->position,
            'contact_number' => $this->normalizePhilippineContactNumber($request->contact_number),
        ]);

        return redirect()->route('admin2.proponents.index')->with('success', 'Proponent updated successfully.');
    }

    public function destroy(Proponent $proponent)
    {
        $user = $proponent->user;
        $proponent->delete();
        $user->delete();
        return redirect()->route('admin2.proponents.index')->with('success', 'Proponent deleted successfully.');
    }

    private function normalizePhilippineContactNumber(string $contactNumber): string
    {
        $digits = preg_replace('/\D+/', '', trim($contactNumber)) ?? '';

        if ($digits === '') {
            return '09';
        }

        if (str_starts_with($digits, '63')) {
            $digits = '0' . substr($digits, 2);
        }

        if (str_starts_with($digits, '09')) {
            return substr($digits, 0, 11);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '9')) {
            return '0' . $digits;
        }

        return '09' . substr($digits, -9);
    }
}
