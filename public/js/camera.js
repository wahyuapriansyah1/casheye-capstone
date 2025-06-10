document.addEventListener('DOMContentLoaded', function() {
      const canvas = document.getElementById('cameraCanvas');
      const ctx = canvas.getContext('2d');
      const frontCameraBtn = document.getElementById('frontCameraBtn');
      const backCameraBtn = document.getElementById('backCameraBtn');
      const captureBtn = document.getElementById('captureBtn');
      
      let currentFacingMode = 'environment'; // Default ke kamera belakang
      let stream = null;
      let video = document.createElement('video');
      
      // Set canvas size
      function setCanvasSize() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
      
      // Fungsi untuk memulai kamera
      async function startCamera(facingMode) {
        // Hentikan stream yang sedang berjalan jika ada
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setCanvasSize();
        
        const constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          video.srcObject = stream;
          video.play();
          
          // Update tampilan tombol
          updateButtonStates(facingMode);
          
          // Mulai menggambar frame ke canvas
          drawVideoFrame();
        } catch (error) {
          console.error('Error accessing camera:', error);
          alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
          
          // Coba fallback ke constraints dasar jika gagal
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.play();
            currentFacingMode = 'user'; // Asumsi ini adalah kamera depan
            updateButtonStates(currentFacingMode);
            drawVideoFrame();
          } catch (fallbackError) {
            console.error('Fallback camera access failed:', fallbackError);
            // Tampilkan pesan error di canvas
            showErrorOnCanvas('Kamera tidak dapat diakses');
          }
        }
      }
      
      // Fungsi untuk menggambar frame video ke canvas
      function drawVideoFrame() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          // Sesuaikan ukuran gambar dengan canvas sambil mempertahankan aspect ratio
          const videoAspectRatio = video.videoWidth / video.videoHeight;
          const canvasAspectRatio = canvas.width / canvas.height;
          
          let renderWidth, renderHeight, offsetX, offsetY;
          
          if (videoAspectRatio > canvasAspectRatio) {
            // Video lebih lebar dari canvas
            renderHeight = canvas.height;
            renderWidth = renderHeight * videoAspectRatio;
            offsetX = (canvas.width - renderWidth) / 2;
            offsetY = 0;
          } else {
            // Video lebih tinggi dari canvas
            renderWidth = canvas.width;
            renderHeight = renderWidth / videoAspectRatio;
            offsetX = 0;
            offsetY = (canvas.height - renderHeight) / 2;
          }
          
          // Gambar frame video
          ctx.drawImage(video, offsetX, offsetY, renderWidth, renderHeight);
        }
        
        // Lanjutkan animasi
        requestAnimationFrame(drawVideoFrame);
      }
      
      // Fungsi untuk menampilkan error di canvas
      function showErrorOnCanvas(message) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(message, canvas.width/2, canvas.height/2);
      }
      
      // Fungsi untuk update state tombol
      function updateButtonStates(facingMode) {
        if (facingMode === 'user') {
          frontCameraBtn.classList.add('btn-active');
          backCameraBtn.classList.remove('btn-active');
        } else {
          frontCameraBtn.classList.remove('btn-active');
          backCameraBtn.classList.add('btn-active');
        }
      }
      
      // Fungsi untuk menangkap gambar
      function captureImage() {
        // Buat elemen img sementara untuk menampilkan hasil capture
        const img = new Image();
        img.src = canvas.toDataURL('image/png');
        
        // Di sini Anda bisa melakukan sesuatu dengan gambar yang diambil
        console.log('Gambar diambil:', img.src);
        alert('Gambar berhasil diambil! Lihat console untuk hasilnya.');
      }
      
      // Event listener untuk tombol kamera depan
      frontCameraBtn.addEventListener('click', function() {
        currentFacingMode = 'user';
        startCamera(currentFacingMode);
      });
      
      // Event listener untuk tombol kamera belakang
      backCameraBtn.addEventListener('click', function() {
        currentFacingMode = 'environment';
        startCamera(currentFacingMode);
      });
      
      // Event listener untuk tombol capture
      captureBtn.addEventListener('click', captureImage);
      
      // Event listener untuk resize window
      window.addEventListener('resize', function() {
        setCanvasSize();
      });
      
      // Mulai kamera saat halaman dimuat
      startCamera(currentFacingMode);
    });
