<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\TimeLog;
use App\Models\Project;
use Illuminate\Support\Facades\Mail;
use App\Mail\DailyTimeReport;
use App\Mail\AdminDailyTimeReport;
use Carbon\Carbon;

class SendDailyTimeReport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'report:daily-time';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily time tracking reports to employees, admins, and project managers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();

        // 1. Get all companies
        $companies = \App\Models\Company::where('status', 'active')->get();

        foreach ($companies as $company) {
            $this->info("Processing company: {$company->name}");

            // Set tenant scope manually if needed, or just filter by company_id
            // Since this is a console command, we don't have auth context, so we filter manually

            $users = User::where('company_id', $company->id)->where('status', 'active')->get();
            
            $adminReportData = [];
            $pmReportData = []; // Key: PM User ID, Value: Array of report data

            foreach ($users as $user) {
                // Get today's logs for this user
                $todayLogs = TimeLog::where('user_id', $user->id)
                    ->whereDate('start_time', $today)
                    ->with(['project', 'task'])
                    ->get();

                if ($todayLogs->isEmpty()) {
                    continue;
                }

                // Calculate weekly total duration (minutes)
                $weeklyTotal = TimeLog::where('user_id', $user->id)
                    ->where('start_time', '>=', $startOfWeek)
                    ->where('start_time', '<=', Carbon::now())
                    ->sum('duration');

                // Send Email to Employee
                // Use company mail configuration if available, otherwise default env
                try {
                    $mail = new DailyTimeReport($user, $todayLogs, $weeklyTotal);
                    
                    // Set FROM address to Company Email if available
                    if ($company->email) {
                        $mail->from($company->email, $company->name);
                    }

                    Mail::to($user->email)->send($mail);
                    $this->info("Report sent to employee: {$user->email}");
                } catch (\Exception $e) {
                    $this->error("Failed to send to {$user->email}: " . $e->getMessage());
                }

                // Prepare Admin Data (All logs for this company)
                $adminReportData[] = [
                    'user' => $user,
                    'logs' => $todayLogs,
                    'weekly_total' => $weeklyTotal
                ];

                // Prepare Project Manager Data
                foreach ($todayLogs as $log) {
                    $project = $log->project;
                    // Ensure project belongs to same company (extra safety)
                    if ($project && $project->manager_id && $project->company_id === $company->id) {
                        $pmId = $project->manager_id;
                        
                        // Initialize PM bucket if not exists
                        if (!isset($pmReportData[$pmId])) {
                            $pmReportData[$pmId] = [];
                        }
                        
                        // Check if we already have an entry for this user for this PM
                        if (!isset($pmReportData[$pmId][$user->id])) {
                            $pmReportData[$pmId][$user->id] = [
                                'user' => $user,
                                'logs' => collect([]), // Start with empty collection
                                'weekly_total' => $weeklyTotal
                            ];
                        }
                        
                        // Add this specific log to the PM's view for this user
                        $pmReportData[$pmId][$user->id]['logs']->push($log);
                    }
                }
            }

            // 2. Send Admin Report (To Company Admins)
            $admins = User::where('company_id', $company->id)
                ->where('role', 'admin')
                ->where('status', 'active')
                ->get();

            foreach ($admins as $admin) {
                try {
                    if (!empty($adminReportData)) {
                        $mail = new AdminDailyTimeReport($adminReportData, $today);
                        
                        // Set FROM address to Company Email if available
                        if ($company->email) {
                            $mail->from($company->email, $company->name);
                        }

                        Mail::to($admin->email)->send($mail);
                        $this->info("Report sent to company admin: {$admin->email}");
                    }
                } catch (\Exception $e) {
                    $this->error("Failed to send to admin {$admin->email}: " . $e->getMessage());
                }
            }

            // 3. Send Project Manager Reports
            foreach ($pmReportData as $pmId => $usersData) {
                $pm = User::find($pmId);
                // Ensure PM belongs to this company
                if ($pm && $pm->status === 'active' && $pm->company_id === $company->id) {
                    // Skip if PM is also an Admin (they already received the full report)
                    if ($pm->role === 'admin') {
                        continue;
                    }

                    // Convert associative array to indexed array for the view
                    $reportData = array_values($usersData);
                    
                    try {
                        $mail = new AdminDailyTimeReport($reportData, $today);

                        // Set FROM address to Company Email if available
                        if ($company->email) {
                            $mail->from($company->email, $company->name);
                        }

                        Mail::to($pm->email)->send($mail);
                        $this->info("Report sent to PM: {$pm->email}");
                    } catch (\Exception $e) {
                        $this->error("Failed to send to PM {$pm->email}: " . $e->getMessage());
                    }
                }
            }
        }

        $this->info('Daily reports processed for all companies.');
    }
}
