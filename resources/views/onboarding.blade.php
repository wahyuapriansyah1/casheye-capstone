<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Casheye - Akses Kamera</title>

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
  <link rel="manifest" href="{{ asset('manifest.json') }}">
  <meta name="theme-color" content="#1E3A8A">
</head>
<body class="d-flex justify-content-center align-items-center vh-100 bg-light">

  <div class="text-center px-4">
    <img src="{{ asset('img/LogoCasheye.png') }}" alt="Casheye Logo" class="logo-onboarding mb-4">

    <h5 class="fw-semibold">Selamat Datang di Casheye!</h5>
    <p class="mb-4">
      Casheye bantu kamu mengenali uang! Cukup arahkan kamera ke pecahan uang, lalu
      nilai uang akan muncul lewat suara, tampilan, atau getaran.
    </p>

    <a href="{{ url('/kamera') }}" class="btn btn-primary px-4">Izinkan Akses Kamera</a>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('{{ asset('service-worker.js') }}');
      });
    }
  </script>
</body>
</html>
