<?php

namespace App\Http\Controllers;

use App\Models\Evaluator;
use App\Models\User;
use App\Models\DomainExpertise;
use App\Models\Role;
use Illuminate\Http\Request;

class EvaluatorController extends Controller
{
    public function index()
    {
        $evaluators = Evaluator::with(['user', 'domainExpertise'])->get();
        return inertia('Admin/Evaluator/Index', [
            'evaluators' => $evaluators
        ]);
    }

    public function create()
    {
        return inertia('Admin/Evaluator/Create', [
            'users' => User::all(),
            'domains' => DomainExpertise::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'domain_expertise_id' => 'required|exists:domain_expertise,id',
        ]);

        $user = User::findOrFail($request->user_id);

        // Assign evaluator role automatically
        $role = Role::where('name', 'evaluator')->first();
        if ($role && $user->role_id !== $role->id) {
            $user->role_id = $role->id;
            $user->save();
        }

        Evaluator::create($request->only(['user_id', 'domain_expertise_id']));

        return redirect()->route('evaluators.index')->with('success', 'Evaluator added successfully.');
    }

    public function edit(Evaluator $evaluator)
    {
        return inertia('Admin/Evaluator/Edit', [
            'evaluator' => $evaluator,
            'users' => User::all(),
            'domains' => DomainExpertise::all()
        ]);
    }

    public function update(Request $request, Evaluator $evaluator)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'domain_expertise_id' => 'required|exists:domain_expertise,id',
        ]);

        $evaluator->update($request->only(['user_id', 'domain_expertise_id']));

        return redirect()->route('evaluators.index')->with('success', 'Evaluator updated successfully.');
    }

    public function destroy(Evaluator $evaluator)
    {
        $evaluator->delete();
        return redirect()->route('evaluators.index')->with('success', 'Evaluator deleted successfully.');
    }
}
