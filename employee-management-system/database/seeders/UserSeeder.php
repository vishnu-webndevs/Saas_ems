<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            // Create Admin for this company
            $adminEmail = $company->email; // Use company email as admin email for simplicity
            
            User::create([
                'name' => 'Admin ' . $company->name,
                'email' => $adminEmail,
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'company_id' => $company->id,
                'phone' => $company->phone,
                'department' => 'Management',
                'position' => 'Company Administrator',
                'status' => 'active',
                'hire_date' => '2020-01-01',
            ]);

            // Create sample employees for this company
            $employees = [
                [
                    'name' => 'John Smith (' . $company->name . ')',
                    'email' => 'john.' . $company->id . '@example.com',
                    'role' => 'employee',
                    'department' => 'Development',
                    'position' => 'Senior Developer',
                ],
                [
                    'name' => 'Sarah Johnson (' . $company->name . ')',
                    'email' => 'sarah.' . $company->id . '@example.com',
                    'role' => 'employee',
                    'department' => 'Design',
                    'position' => 'UI/UX Designer',
                ],
                [
                    'name' => 'Michael Brown (' . $company->name . ')',
                    'email' => 'michael.' . $company->id . '@example.com',
                    'role' => 'employee',
                    'department' => 'Marketing',
                    'position' => 'Marketing Manager',
                ],
            ];

            foreach ($employees as $empData) {
                User::create([
                    'name' => $empData['name'],
                    'email' => $empData['email'],
                    'password' => Hash::make('password123'),
                    'role' => $empData['role'],
                    'company_id' => $company->id,
                    'department' => $empData['department'],
                    'position' => $empData['position'],
                    'status' => 'active',
                    'hire_date' => now()->subMonths(rand(1, 24)),
                ]);
            }
        }
    }
}
