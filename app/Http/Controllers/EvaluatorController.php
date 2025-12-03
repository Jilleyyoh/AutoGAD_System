<?php

namespace App\Http\Controllers;

use App\Models\DomainExpertise;
use App\Models\Evaluator;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluatorController extends Controller
{
    /**
     * Display a listing of evaluators.
     */
    public function index()
    {
        // Query evaluators with explicit relationships
        $evaluators = Evaluator::with(['user', 'domainExpertise'])->get();
        
        // Transform data to ensure it's properly formatted for the frontend
        $formattedEvaluators = $evaluators->map(function ($evaluator) {
            return [
                'id' => $evaluator->id,
                'user_id' => $evaluator->user_id,
                'domain_expertise_id' => $evaluator->domain_expertise_id,
                'created_at' => $evaluator->created_at,
                'updated_at' => $evaluator->updated_at,
                'user' => $evaluator->user ? [
                    'id' => $evaluator->user->id,
                    'name' => $evaluator->user->name,
                    'email' => $evaluator->user->email,
                ] : null,
                'domainExpertise' => $evaluator->domainExpertise ? [
                    'id' => $evaluator->domainExpertise->id,
                    'domain_name' => $evaluator->domainExpertise->domain_name,
                    'description' => $evaluator->domainExpertise->description,
                ] : null,
            ];
        });
        
        // Log what we're sending to the frontend for debugging
        \Log::info('Evaluators data being sent to frontend:', ['evaluators' => $formattedEvaluators]);
        
        return Inertia::render('admin1/evaluator/index', [
            'evaluators' => $formattedEvaluators,
        ]);
    }

    /**
     * Show the form for creating a new evaluator.
     */
    public function create()
    {
        // Get domain expertise options
        $domains = DomainExpertise::all();
        
        // Get the evaluator role ID for reference
        $evaluatorRole = Role::where('name', 'Evaluator')->first();
        $evaluatorRoleId = $evaluatorRole ? $evaluatorRole->id : 2; // Default to 2 if not found
        
        return Inertia::render('admin1/evaluator/create', [
            'domains' => $domains,
            'evaluatorRoleId' => $evaluatorRoleId,
        ]);
    }

    /**
     * Store a newly created evaluator in storage.
     */
    public function store(Request $request)
    {
        // Creating a new user with evaluator role
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'domain_expertise_id' => 'required|exists:domain_expertises,id',
        ]);

        // Get the evaluator role ID (fixed as 2)
        $evaluatorRoleId = 2;

        // Create the user with explicit role_id
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role_id' => $evaluatorRoleId,
        ]);

        // Create the evaluator
        Evaluator::create([
            'user_id' => $user->id,
            'domain_expertise_id' => $request->domain_expertise_id,
        ]);

        return redirect()->route('evaluators.index')
                        ->with('success', 'New evaluator created successfully.');
    }

    /**
     * Show the form for editing the specified evaluator.
     */
    public function edit(Evaluator $evaluator)
    {
        // Get all domain expertise options
        $domains = DomainExpertise::all();
        
        // Explicitly load relationships
        $evaluator->load(['user', 'domainExpertise']);
        
        // Get the current domain directly if needed
        $currentDomain = DomainExpertise::find($evaluator->domain_expertise_id);
        
        // Create a manually formatted evaluator with guaranteed structure
        $formattedEvaluator = [
            'id' => $evaluator->id,
            'user_id' => $evaluator->user_id,
            'domain_expertise_id' => $evaluator->domain_expertise_id,
            'created_at' => $evaluator->created_at,
            'updated_at' => $evaluator->updated_at,
            'user' => [
                'id' => $evaluator->user->id,
                'name' => $evaluator->user->name,
                'email' => $evaluator->user->email,
            ],
            'domainExpertise' => $currentDomain ? [
                'id' => $currentDomain->id,
                'domain_name' => $currentDomain->domain_name,
                'description' => $currentDomain->description,
            ] : null,
        ];
        
        // Log what we're sending to the frontend
        \Log::info('Edit evaluator data:', ['evaluator' => $formattedEvaluator]);
        
        return Inertia::render('admin1/evaluator/edit', [
            'evaluator' => $formattedEvaluator,
            'domains' => $domains,
        ]);
    }

    /**
     * Update the specified evaluator in storage.
     */
    public function update(Request $request, Evaluator $evaluator)
    {
        $validationRules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $evaluator->user_id,
            'domain_expertise_id' => 'required|exists:domain_expertises,id',
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
        $user = $evaluator->user;
        $user->update($userData);

        // Update domain expertise
        $domainId = (int)$request->domain_expertise_id;
        
        // Verify the domain exists
        $domain = DomainExpertise::find($domainId);
        if (!$domain) {
            return redirect()->back()->withErrors(['domain_expertise_id' => 'The selected domain expertise does not exist.']);
        }
        
        // Update evaluator's domain expertise
        $evaluator->domain_expertise_id = $domainId;
        $evaluator->save();
        
        // Refresh the model to ensure relationships are loaded
        $evaluator->refresh();
        
        // Get the domain name for display in the success message
        $domainName = $domain->domain_name;

        return redirect()->route('evaluators.index')
                         ->with('success', "Evaluator updated successfully. Domain set to: {$domainName}");
    }

    /**
     * Remove the specified evaluator from storage.
     */
    public function destroy(Evaluator $evaluator)
    {
        // Start a database transaction to ensure both operations succeed or fail together
        \DB::beginTransaction();
        try {
            // Get the associated user
            $user = $evaluator->user;
            
            // Delete the evaluator record first (due to foreign key constraint)
            $evaluator->delete();
            
            // Delete the associated user record
            if ($user) {
                $user->delete();
            }
            
            // If we get here, both operations succeeded
            \DB::commit();
            
            return redirect()->route('evaluators.index')
                            ->with('success', 'Evaluator and associated user account removed successfully.');
        } catch (\Exception $e) {
            // If anything goes wrong, roll back the transaction
            \DB::rollBack();
            
            return redirect()->route('evaluators.index')
                            ->with('error', 'Failed to remove evaluator. Please try again.');
        }
    }
}
