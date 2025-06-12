<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Casheye - Kamera Otomatis</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <link rel="manifest" href="{{ asset('manifest.json') }}">
  <meta name="theme-color" content="#1E3A8A">
  <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body class="bg-light d-flex justify-content-center align-items-center vh-100">

  <div class="container text-center">
    <img src="{{ asset('img/LogoCasheye.png') }}" alt="Casheye Logo" class="logo-camera mb-3">
    
    <div class="camera-frame-responsive position-relative mx-auto">
      <canvas id="cameraCanvas"></canvas>
      <div class="green-screen"></div>
      <p class="instruction-inside mb-0">Arahkan Uang ke kamera</p>
    </div>
    
    <div class="camera-controls">
      <button id="frontCameraBtn" class="btn btn-switch btn-camera">Kamera Depan</button>
      <button id="backCameraBtn" class="btn btn-switch btn-camera btn-active">Kamera Belakang</button>
      {{-- <button id="captureBtn" class="btn btn-capture btn-camera">Ambil Foto</button> --}}
    </div>

    {{-- BAGIAN UNTUK LOADING, HASIL, DAN ERROR --}}
    <div id="loading" class="mt-4 text-center" style="display:none;">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p>Sedang mendeteksi...</p>
    </div>

    <div id="result" class="mt-4 alert alert-info" style="display:none;">
        <h4>Nominal Terdeteksi: <strong id="nominalResult"></strong></h4>
        <p>Kepercayaan: <strong id="confidenceResult"></strong>%</p>
        <button id="playAudio" class="btn btn-success mt-2" style="display:none;">Putar Suara Ulang</button>
    </div>

    <div id="error" class="mt-4 alert alert-danger" style="display:none;">
        <h4>Error:</h4>
        <p id="errorMessage"></p>
    </div>
    {{-- AKHIR BAGIAN INI --}}

  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  
  <script>
      // Definisikan variabel JavaScript di sini
      window.laravelRoutes = {
          scanProcess: '{{ route('scan.process') }}'
      };
      // Konfigurasi tambahan untuk auto-scan
      window.casheyeConfig = {
          scanIntervalMs: 1500, // Scan setiap 1.5 detik
          minConfidenceThreshold: 0.5, // Minimal 50% confidence untuk dianggap valid
          speechCooldownMs: 5000 // Setelah nominal diucapkan, tunggu 5 detik sebelum bisa diucapkan lagi
      };
  </script>

  <script src="{{ asset('js/camera.js') }}"></script>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('{{ asset('service-worker.js') }}');
      });
    }
  </script>
</body>
</html>