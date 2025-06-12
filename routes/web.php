<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ScanUangController; // <<< TAMBAHKAN INI

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('index');
});

// Route untuk tampilan kamera (dari kamu, tapi pakai controller)
Route::get('/kamera', [ScanUangController::class, 'index'])->name('kamera.index'); // <<< MODIFIKASI INI

Route::get('/onboarding', function () {
    return view('onboarding');
});

// <<< TAMBAHKAN DUA ROUTE DI BAWAH INI >>>
// Route untuk memproses upload gambar ke API ML
Route::post('/scan/process', [ScanUangController::class, 'processScan'])->name('scan.process');