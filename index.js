const fetch = require('node-fetch');
const http = require('http');

const TOKENS = process.env.TOKENS ? process.env.TOKENS.split(',') : [];
const CHANNEL_IDS = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',') : [];
const MESSAGE = process.env.MESSAGE;

let currentTokenIndex = 0;
let currentChannelIndex = 0;

// 9 hesap için 3 saniye döngü hedefi: 3000 / 9 = 333ms
const TICK_RATE = 333; 

if (!TOKENS.length || !CHANNEL_IDS.length || !MESSAGE) {
    console.error("Hata: Değişkenler eksik!");
    process.exit(1);
}

const sendTick = async () => {
    const token = TOKENS[currentTokenIndex].trim();
    const channelId = CHANNEL_IDS[currentChannelIndex].trim();

    // Bir sonraki tick için indeksleri hemen güncelle (Bekleme yapmadan)
    currentTokenIndex = (currentTokenIndex + 1) % TOKENS.length;
    // Her atışta kanalı da değiştiriyoruz
    currentChannelIndex = (currentChannelIndex + 1) % CHANNEL_IDS.length;

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

        if (response.ok) {
            console.log(`[+] Hesap ${currentTokenIndex + 1} ATTI!`);
        } else if (response.status === 429) {
            console.log(`[!] Hesap ${currentTokenIndex + 1} LİMİTTE, ATLANDI.`);
        } else {
            console.log(`[!] Hata ${response.status}, SIRADAKİNE GEÇİLİYOR.`);
        }
    } catch (error) {
        console.log("Bağlantı hatası, durmak yok...");
    }
};

// ANA DÖNGÜ: Her 333ms'de bir ateş eder
// Bu döngü hiçbir hatadan veya bekletmeden etkilenmez
setInterval(sendTick, TICK_RATE);

// Render hayatta kalsın diye
http.createServer((req, res) => res.end("Maksimum Hiz Modu Aktif")).listen(process.env.PORT || 3000);
