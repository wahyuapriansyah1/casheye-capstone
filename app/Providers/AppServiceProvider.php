<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // <<< PASTIKAN BARIS INI ADA DI ATAS

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // <<< TAMBAHKAN KODE INI DI SINI >>>
        if (config('app.env') === 'production') { // Pastikan hanya berlaku di production
            URL::forceScheme('https');
        }
        // <<< AKHIR KODE TAMBAHAN >>>
    }
}