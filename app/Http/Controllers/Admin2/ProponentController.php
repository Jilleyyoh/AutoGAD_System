<?php

namespace App\Http\Controllers\Admin2;

use App\Models\Proponent;
use App\Models\User;
use App\Models\Role;
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

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'birthdate' => 'required|date_format:Y-m-d',
            'organization' => 'required|string|max:150',
            'position' => 'nullable|string|max:100',
            'contact_number' => 'nullable|string|max:20',
        ]);

        // Get proponent role (role_id = 1)
        $role = Role::where('name', 'proponent')->firstOrFail();

        // Auto-generate password as registered date (MM-DD-YYYY format)
        $registeredDate = now()->format('m-d-Y');

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'birthdate' => $request->birthdate,
            'password' => Hash::make($registeredDate),
            'role_id' => $role->id,
        ]);

        // Create proponent profile
        Proponent::create([
            'user_id' => $user->id,
            'organization' => $request->organization,
            'position' => $request->position,
            'contact_number' => $request->contact_number,
        ]);

        return redirect()->route('admin2.proponents.index')->with('success', 'Proponent created successfully. Default password is the registered date: ' . $registeredDate);
    }

    public function edit(Proponent $proponent)
    {
        return Inertia::render('admin2/proponents/edit', [
            'proponent' => $proponent->load('user')
        ]);
    }

    public function update(Request $request, Proponent $proponent)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email,' . $proponent->user_id,
            'birthdate' => 'required|date_format:Y-m-d',
            'organization' => 'required|string|max:150',
            'position' => 'nullable|string|max:100',
            'contact_number' => 'nullable|string|max:20',
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
            'contact_number' => $request->contact_number,
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
}
