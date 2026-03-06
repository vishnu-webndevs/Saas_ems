<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'plan',
        'plan_id',
        'status',
    ];

    public function activePlan()
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
