<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            $projects = Project::where('company_id', $company->id)->get();
            $employees = User::where('company_id', $company->id)->where('role', 'employee')->get();
            $admin = User::where('company_id', $company->id)->where('role', 'admin')->first();

            if ($projects->isEmpty()) {
                continue;
            }

            $tasks = [
                [
                    'title' => 'Design Homepage Mockup',
                    'description' => 'Create high-fidelity mockup for the new homepage design',
                    'status' => 'completed',
                    'priority' => 'high',
                    'due_date' => '2024-01-20',
                    'estimated_hours' => 16,
                    'actual_hours' => 14,
                ],
                [
                    'title' => 'Implement User Authentication',
                    'description' => 'Set up secure user authentication system with JWT tokens',
                    'status' => 'in_progress',
                    'priority' => 'urgent',
                    'due_date' => '2024-02-15',
                    'estimated_hours' => 24,
                    'actual_hours' => 18,
                ],
                [
                    'title' => 'Database Schema Design',
                    'description' => 'Design and implement database schema for the application',
                    'status' => 'pending',
                    'priority' => 'high',
                    'due_date' => '2024-03-01',
                    'estimated_hours' => 12,
                    'actual_hours' => null,
                ],
                [
                    'title' => 'API Documentation',
                    'description' => 'Write comprehensive API documentation for all endpoints',
                    'status' => 'pending',
                    'priority' => 'medium',
                    'due_date' => '2024-02-28',
                    'estimated_hours' => 8,
                    'actual_hours' => null,
                ],
            ];

            foreach ($projects as $project) {
                // Assign some tasks to random employees if available
                foreach ($tasks as $taskData) {
                    // Randomly decide if we create this task for this project
                    if (rand(0, 10) > 3) { // 70% chance
                        Task::create([
                            'title' => $taskData['title'],
                            'description' => $taskData['description'],
                            'project_id' => $project->id,
                            'company_id' => $company->id,
                            'assigned_to' => $employees->isNotEmpty() ? $employees->random()->id : null,
                            'created_by' => $admin ? $admin->id : null,
                            'status' => $taskData['status'],
                            'sort_order' => 0,
                            'priority' => $taskData['priority'],
                            'due_date' => $taskData['due_date'],
                            'estimated_hours' => $taskData['estimated_hours'],
                            'actual_hours' => $taskData['actual_hours'],
                            'notes' => 'Task for ' . $company->name,
                        ]);
                    }
                }
            }
        }
    }
}
