<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Casheye - Kamera dengan Canvas</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <link rel="manifest" href="{{ asset('manifest.json') }}">
  <meta name="theme-color" content="#1E3A8A">
</head>
<body class="bg-light d-flex justify-content-center align-items-center vh-100">

  <div class="container text-center">
    <img src="{{ asset ('img/logo.png') }}" alt="Casheye Logo" class="logo-camera mb-3">
  
    <div class="camera-frame-responsive position-relative mx-auto">
      <canvas id="cameraCanvas"></canvas>
      <div class="green-screen"></div>
      <p class="instruction-inside mb-0">Arahkan Uang ke kamera</p>
    </div>
    
    <div class="camera-controls">
      <button id="frontCameraBtn" class="btn btn-switch btn-camera">Kamera Depan</button>
      <button id="backCameraBtn" class="btn btn-switch btn-camera btn-active">Kamera Belakang</button>
      <button id="captureBtn" class="btn btn-capture btn-camera">Ambil Foto</button>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
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