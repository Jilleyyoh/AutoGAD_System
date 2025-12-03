<?php

namespace App\Http\Controllers;

use App\Models\DomainExpertise;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DomainExpertiseController extends Controller
{
    public function index()
    {
        return Inertia::render('admin1/domainexpertise/index', [
            'domains' => DomainExpertise::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin1/domainexpertise/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'domain_name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        DomainExpertise::create($request->only('domain_name', 'description'));

        return redirect()->route('domain.index')
                         ->with('success', 'Domain expertise created successfully.');
    }

    public function edit(DomainExpertise $domainExpertise)
    {
        return Inertia::render('admin1/domainexpertise/edit', [
            'domain' => $domainExpertise,
        ]);
    }

    public function update(Request $request, DomainExpertise $domainExpertise)
    {
        $request->validate([
            'domain_name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $domainExpertise->update($request->only('domain_name', 'description'));

        return redirect()->route('domain.index')
                         ->with('success', 'Domain expertise updated successfully.');
    }

    public function destroy(DomainExpertise $domainExpertise)
    {
        $domainExpertise->delete();

        return redirect()->route('domain.index')
                         ->with('success', 'Domain expertise deleted successfully.');
    }
}
