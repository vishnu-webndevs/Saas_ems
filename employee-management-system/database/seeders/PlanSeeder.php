<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'description' => 'Perfect for freelancers and small teams',
                'price' => 0.00,
                'duration_in_days' => 30,
                'features' => json_encode(['projects' => 5, 'users' => 3, 'storage' => '1GB']),
                'max_users' => 3,
                'max_projects' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Basic',
                'description' => 'For growing teams',
                'price' => 29.00,
                'duration_in_days' => 30,
                'features' => json_encode(['projects' => 20, 'users' => 10, 'storage' => '10GB']),
                'max_users' => 10,
                'max_projects' => 20,
                'is_active' => true,
            ],
            [
                'name' => 'Pro',
                'description' => 'For professional organizations',
                'price' => 79.00,
                'duration_in_days' => 30,
                'features' => json_encode(['projects' => 100, 'users' => 50, 'storage' => '50GB']),
                'max_users' => 50,
                'max_projects' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'description' => 'For large scale operations',
                'price' => 199.00,
                'duration_in_days' => 30,
                'features' => json_encode(['projects' => 0, 'users' => 0, 'storage' => 'Unlimited']),
                'max_users' => 0,
                'max_projects' => 0,
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::create($plan);
        }
    }
}
