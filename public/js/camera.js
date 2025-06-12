// camera.js

// --- Global Variables ---
let video;
let canvas;
let context;
let currentStream;
let facingMode = 'environment';
let isProcessing = false; // Flag untuk mencegah multiple request bersamaan
let lastDetectedNominal = null; // Nominal terakhir yang berhasil terdeteksi
let lastSpeechTime = 0; // Waktu terakhir nominal diucapkan

// --- UI Elements ---
const frontCameraBtn = document.getElementById('frontCameraBtn');
const backCameraBtn = document.getElementById('backCameraBtn');
// const captureBtn = document.getElementById('captureBtn'); // Hapus referensi ke tombol ini
const loadingDiv = document.getElementById('loading');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const nominalResultSpan = document.getElementById('nominalResult');
const confidenceResultSpan = document.getElementById('confidenceResult');
const errorMessageP = document.getElementById('errorMessage');
const playAudioBtn = document.getElementById('playAudio');

// --- Konfigurasi dari Blade ---
const scanInterval = window.casheyeConfig.scanIntervalMs || 1500; // Default 1.5 detik
const minConfidence = window.casheyeConfig.minConfidenceThreshold || 0.5; // Default 50%
const speechCooldown = window.casheyeConfig.speechCooldownMs || 5000; // Default 5 detik

// --- Fungsi untuk memulai kamera ---
async function startCamera(mode) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    if (loadingDiv) loadingDiv.style.display = 'none';
    if (resultDiv) resultDiv.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';
    if (playAudioBtn) playAudioBtn.style.display = 'none';

    facingMode = mode;

    if (frontCameraBtn) frontCameraBtn.classList.toggle('btn-active', mode === 'user');
    if (backCameraBtn) backCameraBtn.classList.toggle('btn-active', mode === 'environment');

    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: mode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        if (!video) {
            video = document.createElement('video');
            video.style.display = 'none';
            document.body.appendChild(video);
        }

        video.srcObject = currentStream;
        video.play();

        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                function adjustCanvasSize() {
                    if (!video || !canvas || !video.videoWidth) return;

                    const parentContainer = canvas.parentNode;
                    const containerWidth = parentContainer.offsetWidth;
                    const containerHeight = parentContainer.offsetHeight;
                    const aspectRatio = video.videoWidth / video.videoHeight;

                    let newWidth = containerWidth;
                    let newHeight = containerWidth / aspectRatio;

                    if (newHeight > containerHeight) {
                        newHeight = containerHeight;
                        newWidth = containerHeight * aspectRatio;
                    }

                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    canvas.style.width = '100%';
                    canvas.style.height = 'auto';
                    canvas.style.maxWidth = `${video.videoWidth}px`;
                    canvas.style.maxHeight = `${video.videoHeight}px`;
                }

                adjustCanvasSize();
                window.addEventListener('resize', adjustCanvasSize);
                resolve();
            };
        });

        function drawFrame() {
            if (video.paused || video.ended) return;
            if (canvas && context && video.videoWidth > 0 && video.videoHeight > 0) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
            requestAnimationFrame(drawFrame);
        }
        requestAnimationFrame(drawFrame);

        // --- MULAI AUTO-SCAN SETELAH KAMERA AKTIF ---
        startAutoScan();

    } catch (err) {
        console.error("Error accessing camera: ", err);
        if (errorDiv) errorDiv.style.display = 'block';
        if (errorMessageP) errorMessageP.textContent = `Gagal mengakses kamera: ${err.name || err.message}. Pastikan izin kamera diberikan.`;
        // if (captureBtn) captureBtn.disabled = true; // Nonaktifkan tombol ini
        if (frontCameraBtn) frontCameraBtn.disabled = true;
        if (backCameraBtn) backCameraBtn.disabled = true;
    }
}

// --- Fungsi untuk memulai auto-scan ---
let autoScanIntervalId;
function startAutoScan() {
    // Hentikan interval sebelumnya jika ada
    if (autoScanIntervalId) {
        clearInterval(autoScanIntervalId);
    }
    // Mulai interval baru untuk otomatis ambil gambar
    autoScanIntervalId = setInterval(captureImageAndProcess, scanInterval);
    console.log(`Auto-scan dimulai, setiap ${scanInterval}ms.`);
}

// --- Fungsi untuk mengambil gambar dan memprosesnya (pengganti captureImage) ---
async function captureImageAndProcess() {
    // Hanya proses jika tidak sedang memproses request sebelumnya
    if (isProcessing) {
        // console.log("Sedang memproses, lewati frame ini.");
        return;
    }
    if (!video || !currentStream || video.paused || video.ended) {
        // console.warn("Kamera tidak aktif atau berhenti.");
        return;
    }

    isProcessing = true; // Set flag sedang memproses

    // Buat canvas sementara untuk mengambil gambar dengan resolusi video asli
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempContext = tempCanvas.getContext('2d');
    tempContext.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    // Tampilkan loading (opsional, bisa dihilangkan karena auto-scan)
    // if (loadingDiv) loadingDiv.style.display = 'block';
    // if (resultDiv) resultDiv.style.display = 'none';
    // if (errorDiv) errorDiv.style.display = 'none';
    // if (playAudioBtn) playAudioBtn.style.display = 'none';

    tempCanvas.toBlob(async (blob) => {
        if (!blob) {
            // errorMessageP.textContent = "Gagal membuat gambar dari kamera.";
            // errorDiv.style.display = 'block';
            // loadingDiv.style.display = 'none';
            isProcessing = false; // Reset flag
            return;
        }

        const formData = new FormData();
        formData.append('uang_image', blob, 'uang.png');

        const laravelApiUrl = window.laravelRoutes.scanProcess;

        try {
            const response = await fetch(laravelApiUrl, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: formData
            });

            const data = await response.json();

            // if (loadingDiv) loadingDiv.style.display = 'none'; // Sembunyikan loading

            if (response.ok && data.success) {
                const currentNominal = data.nominal;
                const currentConfidence = data.confidence;

                // Tampilkan hasil di UI
                if (nominalResultSpan) nominalResultSpan.textContent = currentNominal;
                if (confidenceResultSpan) confidenceResultSpan.textContent = (currentConfidence * 100).toFixed(2);
                if (resultDiv) resultDiv.style.display = 'block';

                // Logika untuk putar suara otomatis
                // Hanya putar jika confidence cukup tinggi DAN (nominalnya beda ATAU nominal sama tapi sudah cooldown)
                if (currentNominal && currentConfidence >= minConfidence) {
                    const now = Date.now();
                    if (currentNominal !== lastDetectedNominal || (now - lastSpeechTime > speechCooldown)) {
                        playNominalSound(currentNominal);
                        lastDetectedNominal = currentNominal;
                        lastSpeechTime = now;
                        if (playAudioBtn) playAudioBtn.style.display = 'block'; // Tampilkan tombol putar ulang
                    }
                } else {
                    // Jika deteksi tidak valid, reset nominal terakhir untuk deteksi berikutnya
                    lastDetectedNominal = null;
                    if (resultDiv) resultDiv.style.display = 'none'; // Sembunyikan hasil jika tidak terdeteksi
                }

            } else {
                // Tampilkan error jika API ML mengembalikan error
                const msg = data.message || `Terjadi kesalahan: ${JSON.stringify(data.details || {})}`;
                if (errorMessageP) errorMessageP.textContent = msg;
                if (errorDiv) errorDiv.style.display = 'block';
                console.error('API Error:', data);
                // Reset nominal terakhir untuk mencoba deteksi baru
                lastDetectedNominal = null;
            }
        } catch (error) {
            console.error('Error saat mengirim gambar:', error);
            // if (loadingDiv) loadingDiv.style.display = 'none';
            if (errorMessageP) errorMessageP.textContent = `Kesalahan koneksi: ${error.message}. Periksa API ML di Colab atau koneksi internet.`;
            if (errorDiv) errorDiv.style.display = 'block';
            // Reset nominal terakhir untuk mencoba deteksi baru
            lastDetectedNominal = null;
        } finally {
            isProcessing = false; // Pastikan flag direset setelah proses selesai (baik sukses/gagal)
        }
    }, 'image/png');
}

// --- Fungsi Text-to-Speech (TTS) ---
function playNominalSound(text) {
    if ('speechSynthesis' in window) {
        // Hentikan suara yang sedang berjalan agar tidak tumpang tindih
        window.speechSynthesis.cancel(); 

        const utterance = new SpeechSynthesisUtterance();
        utterance.lang = 'id-ID';
        utterance.text = text;

        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            const indonesianVoice = voices.find(voice => voice.lang === 'id-ID' && voice.name.includes('Google'));
            if (indonesianVoice) {
                utterance.voice = indonesianVoice;
            }
            window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length > 0) {
            setVoice();
        } else {
            window.speechSynthesis.onvoiceschanged = setVoice;
            console.log("Menunggu suara di-load...");
        }

    } else {
        alert("Browser Anda tidak mendukung fitur suara (Web Speech API). Gunakan browser modern (Chrome/Firefox/Edge).");
        console.warn("Web Speech API tidak didukung di browser ini.");
    }
}

// --- Event Listeners dan Inisialisasi ---
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('cameraCanvas');
    if (canvas) {
        context = canvas.getContext('2d');
    } else {
        console.error("Elemen canvas tidak ditemukan!");
        return;
    }

    // Mulai kamera belakang saat halaman dimuat
    startCamera('environment');

    // Event listener untuk tombol kamera depan
    if (frontCameraBtn) {
        frontCameraBtn.addEventListener('click', () => startCamera('user'));
    }

    // Event listener untuk tombol kamera belakang
    if (backCameraBtn) {
        backCameraBtn.addEventListener('click', () => startCamera('environment'));
    }

    // Event listener untuk tombol putar suara ulang
    if (playAudioBtn) {
        playAudioBtn.addEventListener('click', () => {
            const nominal = nominalResultSpan.textContent;
            if (nominal) {
                playNominalSound(nominal);
            }
        });
    }

    // Hapus event listener captureBtn lama karena sekarang otomatis
    // if (captureBtn) {
    //     captureBtn.removeEventListener('click', captureImage);
    //     captureBtn.style.display = 'none'; // Opsional: sembunyikan tombol
    // }
});