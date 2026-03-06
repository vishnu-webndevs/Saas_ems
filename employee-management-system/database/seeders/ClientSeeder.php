<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Company;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            $clients = [
                [
                    'name' => 'TechCorp Solutions (' . $company->name . ')',
                    'email' => 'contact.' . $company->id . '@techcorp.com',
                    'company_id' => $company->id,
                    'phone' => '+1987654321',
                    'address' => '123 Tech Street, Silicon Valley, CA 94025',
                    'company' => 'TechCorp Solutions Inc.',
                    'website' => 'https://techcorp.com',
                    'status' => 'active',
                    'notes' => 'Long-term client, excellent payment history',
                ],
                [
                    'name' => 'Global Marketing Group (' . $company->name . ')',
                    'email' => 'info.' . $company->id . '@globalmarketing.com',
                    'company_id' => $company->id,
                    'phone' => '+1876543210',
                    'address' => '456 Marketing Ave, New York, NY 10001',
                    'company' => 'Global Marketing Group LLC',
                    'website' => 'https://globalmarketing.com',
                    'status' => 'active',
                    'notes' => 'New client with multiple ongoing projects',
                ],
                [
                    'name' => 'Innovation Labs (' . $company->name . ')',
                    'email' => 'hello.' . $company->id . '@innovationlabs.com',
                    'company_id' => $company->id,
                    'phone' => '+1765432109',
                    'address' => '789 Innovation Blvd, Boston, MA 02101',
                    'company' => 'Innovation Labs Co.',
                    'website' => 'https://innovationlabs.com',
                    'status' => 'active',
                    'notes' => 'Startup client with exciting projects',
                ],
            ];

            foreach ($clients as $client) {
                Client::create($client);
            }
        }
    }
}
