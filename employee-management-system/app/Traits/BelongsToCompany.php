<?php

namespace App\Traits;

use App\Models\Company;
use App\Models\Scopes\TenantScope;
use Illuminate\Support\Facades\Auth;

trait BelongsToCompany
{
    /**
     * The "booted" method of the model.
     */
    protected static function bootBelongsToCompany(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            // Automatically set company_id if user is authenticated and has company_id
            // Only set if not already set (allows manual override for super admin creating data for others)
            if (!$model->company_id && Auth::check() && Auth::user()->company_id) {
                $model->company_id = Auth::user()->company_id;
            }
        });
    }

    /**
     * Get the company that owns the model.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
