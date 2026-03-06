<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToCompany;

class ActivityLog extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'user_id',
        'project_id',
        'time_log_id',
        'company_id',
        'activity_type',
        'window_title',
        'application_name',
        'url',
        'started_at',
        'ended_at',
        'duration',
        'keyboard_count',
        'mouse_click_count',
        'mouse_scroll_count',
        'desktop_app_id',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function timeLog()
    {
        return $this->belongsTo(TimeLog::class);
    }
}
