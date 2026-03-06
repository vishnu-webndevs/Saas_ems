<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToCompany;

class Client extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'name',
        'email',
        'company_id',
        'phone',
        'address',
        'company',
        'website',
        'status',
        'notes',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function projects()
    {
        return $this->hasMany(Project::class);
    }
}
