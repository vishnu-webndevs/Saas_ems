<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_in_days',
        'features',
        'max_users',
        'max_projects',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'max_users' => 'integer',
        'max_projects' => 'integer',
        'duration_in_days' => 'integer',
    ];

    public function companies()
    {
        return $this->hasMany(Company::class);
    }
}
