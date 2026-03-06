<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Demo Company 1
        Company::create([
            'name' => 'Tech Solutions Inc.',
            'email' => 'admin@techsolutions.com',
            'phone' => '+1234567890',
            'plan' => 'enterprise',
            'status' => 'active',
        ]);

        // Demo Company 2
        Company::create([
            'name' => 'Startup Hub LLC',
            'email' => 'admin@startuphub.com',
            'phone' => '+1987654321',
            'plan' => 'standard',
            'status' => 'active',
        ]);
    }
}
