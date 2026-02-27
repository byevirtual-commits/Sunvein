const fetch = require('node-fetch');
const http = require('http');

// Render Environment Variables
const TOKENS = process.env.TOKENS ? process.env.TOKENS.split(',') : [];
const CHANNEL_IDS = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',') : [];
const MESSAGE = process.env.MESSAGE;

if (!TOKENS.length || !CHANNEL_IDS.length || !MESSAGE) {
    console.error("Hata: TOKENS, CHANNEL_IDS veya MESSAGE ortam değişkenleri eksik!");
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

        const data = await response.json();

        if (response.status === 429) {
            // Rate limit (hız sınırı) kontrolü
            const retryAfter = data.retry_after || 5000;
            console.log(`Hız sınırı! Kanal: ${channelId}, Bekleme: ${retryAfter}ms`);
            setTimeout(() => sendMessage(token, channelId), retryAfter);
        } else if (response.ok) {
            console.log(`Başarılı! Kanal: ${channelId} | Token: ${token.substring(0, 5)}...`);
            // 0 saniye hedefi için çok kısa (10ms) gecikmeyle tekrarla
            setTimeout(() => sendMessage(token, channelId), 10);
        } else {
            console.log(`Hata (${response.status}): Kanal ${channelId} veya Token geçersiz.`);
        }
    } catch (error) {
        console.error("Bağlantı hatası:", error);
        setTimeout(() => sendMessage(token, channelId), 1000);
    }
};

// Her token için tüm kanallarda işlemi başlat
TOKENS.forEach(token => {
    CHANNEL_IDS.forEach(channelId => {
        sendMessage(token, channelId);
    });
});

// Render'ın port hatası vermemesi için basit sunucu
http.createServer((req, res) => res.end("Bot Aktif!")).listen(process.env.PORT || 3000);
