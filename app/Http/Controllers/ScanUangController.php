<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log; // Untuk logging error di sisi server

class ScanUangController extends Controller
{
    public function index()
    {
        return view('kamera'); // Mengacu ke view kamera.blade.php
    }

    public function processScan(Request $request)
    {
        // Validasi Request: Pastikan ada file gambar yang diupload
        $request->validate([
            'uang_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ], [
            'uang_image.required' => 'Mohon unggah gambar uang untuk dideteksi.',
            'uang_image.image' => 'File yang diunggah harus berupa gambar.',
            'uang_image.mimes' => 'Format gambar yang diizinkan: JPEG, PNG, JPG, GIF.',
            'uang_image.max' => 'Ukuran gambar tidak boleh lebih dari 2 MB.'
        ]);

        $imageFile = $request->file('uang_image');

        // --- GANTI DENGAN URL NGROK KAMU SAAT INI ---
        // Contoh: $mlApiUrl = 'https://e8f5-34-57-163-176.ngrok-free.app/detect/';
        $mlApiUrl = 'https://2d69-35-232-129-83.ngrok-free.app/detect/'; 
        // --- END GANTI ---

        try {
            // Kirim Gambar ke API ML (Colab)
            $response = Http::timeout(60) // Perpanjang timeout, Colab bisa lambat
                             ->attach(
                                 'file', // Field name di FastAPI
                                 file_get_contents($imageFile->getRealPath()),
                                 $imageFile->getClientOriginalName(),
                                 ['Content-Type' => $imageFile->getMimeType()]
                             )
                             ->post($mlApiUrl);

            // Periksa Respons dari API ML
            if ($response->successful()) {
                $data = $response->json();
                
                $nominalUang = $data['nominal_uang'] ?? 'Nominal tidak ditemukan';
                $confidence = $data['confidence'] ?? 0.0;

                // Logging (opsional, untuk debugging)
                Log::info('Deteksi ML Berhasil:', ['nominal' => $nominalUang, 'confidence' => $confidence]);

                // Kembalikan Respons Sukses ke Frontend
                return response()->json([
                    'success' => true,
                    'nominal' => $nominalUang,
                    'confidence' => $confidence,
                    'message' => 'Deteksi berhasil!'
                ]);

            } else {
                // Jika API ML mengembalikan error (misal status 4xx atau 5xx)
                Log::error('Deteksi ML Gagal (API Error):', [
                    'status' => $response->status(),
                    'response_body' => $response->body() // Tetap simpan detail teknis di log
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, sistem deteksi uang sedang mengalami kendala. Mohon coba beberapa saat lagi.',
                    // Hapus detail teknis dari pesan user-facing
                    // 'details' => $response->json() // Jangan tampilkan ini ke user
                ], $response->status());
            }

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            // Error koneksi ke API ML (misal Colab mati atau URL ngrok salah)
            Log::error('Koneksi ke API ML gagal:', ['error' => $e->getMessage()]); // Detail teknis di log
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat terhubung ke server deteksi. Pastikan koneksi internet Anda stabil.',
                // 'error_detail' => $e->getMessage() // Jangan tampilkan ini ke user
            ], 500);
        } catch (\Exception $e) {
            // Error umum lainnya
            Log::error('Terjadi kesalahan tak terduga:', ['error' => $e->getMessage()]); // Detail teknis di log
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan tidak terduga. Mohon ulangi proses atau hubungi dukungan.',
                // 'error_detail' => $e->getMessage() // Jangan tampilkan ini ke user
            ], 500);
        }
    }
}