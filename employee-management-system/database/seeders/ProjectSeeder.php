<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Client;
use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            $clients = Client::where('company_id', $company->id)->get();
            $managers = User::where('company_id', $company->id)
                ->where(function ($query) {
                    $query->where('role', 'admin')
                          ->orWhere('department', 'Management');
                })
                ->get();

            if ($clients->isEmpty() || $managers->isEmpty()) {
                continue;
            }

            $projects = [
                [
                    'name' => 'E-commerce Platform Redesign',
                    'description' => 'Complete redesign and development of the e-commerce platform with modern UI/UX',
                    'status' => 'in_progress',
                    'start_date' => '2024-01-15',
                    'end_date' => '2024-06-30',
                    'budget' => 75000.00,
                    'priority' => 'high',
                ],
                [
                    'name' => 'Mobile App Development',
                    'description' => 'Native mobile application for iOS and Android platforms',
                    'status' => 'planning',
                    'start_date' => '2024-03-01',
                    'end_date' => '2024-09-15',
                    'budget' => 120000.00,
                    'priority' => 'urgent',
                ],
                [
                    'name' => 'Marketing Campaign Website',
                    'description' => 'Landing page and marketing website for new product launch',
                    'status' => 'completed',
                    'start_date' => '2023-11-01',
                    'end_date' => '2023-12-15',
                    'budget' => 25000.00,
                    'priority' => 'medium',
                ],
            ];

            foreach ($projects as $project) {
                Project::create([
                    'name' => $project['name'] . ' (' . $company->name . ')',
                    'description' => $project['description'],
                    'client_id' => $clients->random()->id,
                    'manager_id' => $managers->random()->id,
                    'company_id' => $company->id,
                    'status' => $project['status'],
                    'start_date' => $project['start_date'],
                    'end_date' => $project['end_date'],
                    'budget' => $project['budget'],
                    'priority' => $project['priority'],
                    'notes' => 'Project for ' . $company->name,
                ]);
            }
        }
    }
}
