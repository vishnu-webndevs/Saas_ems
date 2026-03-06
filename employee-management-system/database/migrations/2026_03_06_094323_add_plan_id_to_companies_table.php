<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add plan_id column
        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->after('plan')->constrained()->onDelete('set null');
        });

        // 2. Populate plans table
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
                'created_at' => now(),
                'updated_at' => now(),
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
                'created_at' => now(),
                'updated_at' => now(),
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
                'created_at' => now(),
                'updated_at' => now(),
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
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('plans')->insert($plans);

        // 3. Update companies plan_id
        $companies = DB::table('companies')->get();
        foreach ($companies as $company) {
            if ($company->plan) {
                // Match case-insensitive
                $plan = DB::table('plans')->where('name', $company->plan)->first();
                // If not found, try capitalization (e.g. 'free' -> 'Free')
                if (!$plan) {
                    $plan = DB::table('plans')->where('name', ucfirst($company->plan))->first();
                }
                
                if ($plan) {
                    DB::table('companies')->where('id', $company->id)->update(['plan_id' => $plan->id]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropColumn('plan_id');
        });
        
        // Optionally truncate plans table? No, better to leave data.
    }
};
