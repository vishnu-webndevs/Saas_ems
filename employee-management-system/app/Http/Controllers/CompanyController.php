<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class CompanyController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json(Company::withCount('users')->get());
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:companies',
            'phone' => 'nullable|string',
            'plan' => 'nullable|string',
            'admin_name' => 'required|string',
            'admin_email' => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:8',
        ]);

        return DB::transaction(function () use ($validated) {
            $company = Company::create([
                'name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'plan' => $validated['plan'] ?? 'free',
                'status' => 'active',
            ]);

            $admin = User::create([
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['admin_password']),
                'role' => 'admin',
                'company_id' => $company->id,
                'status' => 'active',
            ]);

            return response()->json([
                'message' => 'Company created successfully',
                'company' => $company,
                'admin' => $admin
            ], 201);
        });
    }

    public function show(Company $company)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($company->load('users'));
    }

    public function update(Request $request, Company $company)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email|unique:companies,email,' . $company->id,
            'phone' => 'nullable|string',
            'plan' => 'nullable|string',
            'status' => 'sometimes|in:active,suspended',
        ]);

        $company->update($validated);

        return response()->json($company);
    }

    public function destroy(Company $company)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user || !$user->isSuperAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Deleting company will cascade delete users etc because of foreign key constraint
        $company->delete();

        return response()->json(['message' => 'Company deleted successfully']);
    }
}
