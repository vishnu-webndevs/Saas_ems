<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        /** @var \Illuminate\Database\Eloquent\Model $model */
        if (Auth::hasUser()) {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            
            // If user is super admin, don't apply scope (can see everything)
            // Assuming isSuperAdmin() method exists on User model
            if (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
                return;
            }

            // If user belongs to a company, filter by company_id
            if ($user->company_id) {
                $builder->where($model->getTable() . '.company_id', $user->company_id);
            }
        }
    }
}
