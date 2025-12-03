<?php

namespace App\Http\Controllers;

use App\Models\Proponent;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProponentController extends Controller
{
    /**
     * Display a listing of proponents.
     */
    public function index()
    {
        // Query proponents with explicit relationships
        $proponents = Proponent::with(['user'])->get();
        
        // Transform data to ensure it's properly formatted for the frontend
        $formattedProponents = $proponents->map(function ($proponent) {
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
                ] : null,
            ];
        });
        
        // Log what we're sending to the frontend for debugging
        \Log::info('Proponents data being sent to frontend:', ['proponents' => $formattedProponents]);
        
        return Inertia::render('admin2/proponents/index', [
            'proponents' => $formattedProponents,
        ]);
    }

    /**
     * Show the form for creating a new proponent.
     */
    public function create()
    {
        // Get the proponent role ID
        $proponentRole = Role::where('name', 'Proponent')->first();
        $proponentRoleId = $proponentRole ? $proponentRole->id : 3; // Default to 3 if not found
        
        return Inertia::render('admin2/proponents/create', [
            'proponentRoleId' => $proponentRoleId,
        ]);
    }

    /**
     * Store a newly created proponent in storage.
     */
    public function store(Request $request)
    {
        // Creating a new user with proponent role
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'organization' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
        ]);

        // Get the proponent role ID (fixed as 3)
        $proponentRoleId = 3;

        // Create the user with explicit role_id
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role_id' => $proponentRoleId,
        ]);

        // Create the proponent profile
        Proponent::create([
            'user_id' => $user->id,
            'organization' => $request->organization,
            'position' => $request->position,
            'contact_number' => $request->contact_number,
        ]);

        return redirect()->route('admin2.proponents.index')
                        ->with('success', 'New proponent created successfully.');
    }

    /**
     * Show the form for editing the specified proponent.
     */
    public function edit(Proponent $proponent)
    {
        // Explicitly load relationships
        $proponent->load(['user']);
        
        // Create a manually formatted proponent with guaranteed structure
        $formattedProponent = [
            'id' => $proponent->id,
            'user_id' => $proponent->user_id,
            'organization' => $proponent->organization,
            'position' => $proponent->position,
            'contact_number' => $proponent->contact_number,
            'created_at' => $proponent->created_at,
            'updated_at' => $proponent->updated_at,
            'user' => [
                'id' => $proponent->user->id,
                'name' => $proponent->user->name,
                'email' => $proponent->user->email,
            ],
        ];
        
        // Log what we're sending to the frontend
        \Log::info('Edit proponent data:', ['proponent' => $formattedProponent]);
        
        return Inertia::render('admin2/proponents/edit', [
            'proponent' => $formattedProponent,
        ]);
    }

    /**
     * Update the specified proponent in storage.
     */
    public function update(Request $request, Proponent $proponent)
    {
        $validationRules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $proponent->user_id,
            'organization' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
        ];

        // Add password validation rules only if password is provided
        if ($request->filled('password')) {
            $validationRules['password'] = 'required|min:8|confirmed';
        }

        $request->validate($validationRules);

        // Prepare user data for update
        $userData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        // Add password to update data if provided
        if ($request->filled('password')) {
            $userData['password'] = bcrypt($request->password);
        }

        // Update user information
        $user = $proponent->user;
        $user->update($userData);

        // Update proponent information
        $proponent->update([
            'organization' => $request->organization,
            'position' => $request->position,
            'contact_number' => $request->contact_number,
        ]);

        return redirect()->route('admin2.proponents.index')
                        ->with('success', 'Proponent updated successfully.');
    }

    /**
     * Remove the specified proponent from storage.
     */
    public function destroy(Proponent $proponent)
    {
        // Start a database transaction to ensure both operations succeed or fail together
        \DB::beginTransaction();
        try {
            // Get the associated user
            $user = $proponent->user;
            
            // Delete the proponent record first (due to foreign key constraint)
            $proponent->delete();
            
            // Delete the associated user record
            if ($user) {
                $user->delete();
            }
            
            // If we get here, both operations succeeded
            \DB::commit();
            
            return redirect()->route('admin2.proponents.index')
                            ->with('success', 'Proponent and associated user account removed successfully.');
        } catch (\Exception $e) {
            // If anything goes wrong, roll back the transaction
            \DB::rollBack();
            
            return redirect()->route('admin2.proponents.index')
                            ->with('error', 'Failed to remove proponent. Please try again.');
        }
    }
}
