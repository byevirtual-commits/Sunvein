const fetch = require('node-fetch');
const http = require('http');

const TOKENS = process.env.TOKENS ? process.env.TOKENS.split(',') : [];
const CHANNEL_IDS = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',') : [];
const MESSAGE = process.env.MESSAGE;

let currentTokenIndex = 0;
let currentChannelIndex = 0;
const WAIT_TIME = 3000; // Başarılı mesajdan sonra beklenecek süre

if (!TOKENS.length || !CHANNEL_IDS.length || !MESSAGE) {
    console.error("Değişkenler eksik!");
    process.exit(1);
}

const startLoop = async () => {
    const token = TOKENS[currentTokenIndex].trim();
    const channelId = CHANNEL_IDS[currentChannelIndex].trim();

    try {
        const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({ content: MESSAGE })
        });

        // 1. Durum: Hız Sınırı (Rate Limit) veya IP Engeli
        if (response.status === 429 || response.status === 403 || !response.ok) {
            console.log(`[!] Hesap ${currentTokenIndex + 1} takıldı/limit yedi. SIRADAKİNE GEÇİLİYOR...`);
            
            // Beklemeden bir sonraki hesaba geç
            nextIndex();
            return startLoop(); 
        }

        // 2. Durum: Başarılı Mesaj
        if (response.ok) {
            console.log(`[+] Hesap ${currentTokenIndex + 1} mesajı gönderdi! 3sn mola.`);
            
            // Mesaj başarılı, sonraki hesap ve kanal hazırlığı yap
            nextIndex();
            // Senin istediğin o 3 saniyelik ana döngü beklemesi
            setTimeout(startLoop, WAIT_TIME);
        }

    } catch (error) {
        console.log("Bağlantı hatası, sıradaki hesaba atlanıyor...");
        nextIndex();
        startLoop();
    }
};

// Sıradaki hesabı ve kanalı belirleyen yardımcı fonksiyon
function nextIndex() {
    currentTokenIndex = (currentTokenIndex + 1) % TOKENS.length;
    // Her hesap değişiminde kanalı da değiştirmek istersen (opsiyonel):
    currentChannelIndex = (currentChannelIndex + 1) % CHANNEL_IDS.length;
}

// Sistemi Başlat
startLoop();

// Render için basit server
http.createServer((req, res) => res.end("Atlamali Sistem Aktif")).listen(process.env.PORT || 3000);
