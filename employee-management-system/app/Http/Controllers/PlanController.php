<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        // Allow all authenticated users to see active plans?
        // Or only Superadmin to see all plans (including inactive)?
        if ($user->isSuperAdmin()) {
            return response()->json(Plan::all());
        }

        // Regular users only see active plans
        return response()->json(Plan::where('is_active', true)->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:plans,name|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_in_days' => 'required|integer|min:1',
            'features' => 'nullable|array',
            'max_users' => 'required|integer|min:0',
            'max_projects' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $plan = Plan::create($validated);

        return response()->json($plan, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Plan $plan)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!$plan->is_active && !$user->isSuperAdmin()) {
             return response()->json(['message' => 'Plan not found or inactive'], 404);
        }

        return response()->json($plan);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Plan $plan)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:plans,name,' . $plan->id,
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'duration_in_days' => 'sometimes|integer|min:1',
            'features' => 'nullable|array',
            'max_users' => 'sometimes|integer|min:0',
            'max_projects' => 'sometimes|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $plan->update($validated);

        return response()->json($plan);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Plan $plan)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if any company is using this plan
        if ($plan->companies()->exists()) {
            return response()->json(['message' => 'Cannot delete plan as it is assigned to companies. Deactivate it instead.'], 400);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan deleted successfully']);
    }
}
