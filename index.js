const fetch = require('node-fetch');
const http = require('http');

const TOKENS = process.env.TOKENS ? process.env.TOKENS.split(',') : [];
const CHANNEL_IDS = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',') : [];
const MESSAGE = process.env.MESSAGE;

// Toplam döngü süresi 3 saniye (3000ms)
// 9 hesap olduğu için her hesap arası gecikme: 3000 / 9 = 333ms
const TOTAL_CYCLE = 3000; 
const ACCOUNT_INTERVAL = TOTAL_CYCLE / TOKENS.length; 

if (!TOKENS.length || !CHANNEL_IDS.length || !MESSAGE) {
    console.error("Hata: Değişkenler eksik!");
    process.exit(1);
}

const sendMessage = async (token, channelId) => {
    try {
        const response = await fetch(`https://discord.com/api/v9/channels/${channelId.trim()}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': token.trim(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: MESSAGE })
        });

        // Cloudflare/IP Engeli Kontrolü
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.log("IP Engeli! 10 saniye bekleniyor...");
            return setTimeout(() => sendMessage(token, channelId), 10000);
        }

        if (response.status === 429) {
            const data = await response.json();
            const retryAfter = (data.retry_after * 1000) || 5000;
            setTimeout(() => sendMessage(token, channelId), retryAfter);
        } else {
            // Mesaj gitsin ya da gitmesin, bu hesap tam 3 saniye sonra tekrar sıraya girer
            setTimeout(() => sendMessage(token, channelId), TOTAL_CYCLE);
        }
    } catch (error) {
        setTimeout(() => sendMessage(token, channelId), 5000);
    }
};

// Başlatma Mekanizması: Hesapları aralarında 333ms olacak şekilde sırayla başlatır
TOKENS.forEach((token, index) => {
    CHANNEL_IDS.forEach(channelId => {
        setTimeout(() => {
            console.log(`Hesap ${index + 1} başlatıldı...`);
            sendMessage(token, channelId);
        }, index * ACCOUNT_INTERVAL); 
    });
});

http.createServer((req, res) => res.end("Sistem Calisiyor")).listen(process.env.PORT || 3000);
