const fetch = require('node-fetch');

// Render Environment Variables (Ortam Değişkenleri)
const TOKENS = process.env.TOKENS ? process.env.TOKENS.split(',') : [];
const CHANNEL_ID = process.env.CHANNEL_ID;
const MESSAGE = process.env.MESSAGE;

if (!TOKENS.length || !CHANNEL_ID || !MESSAGE) {
    console.error("Hata: TOKENS, CHANNEL_ID veya MESSAGE eksik!");
    process.exit(1);
}

const sendMessage = async (token) => {
    try {
        const response = await fetch(`https://discord.com/api/v9/channels/${CHANNEL_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': token.trim(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: MESSAGE })
        });

        if (response.status === 429) {
            const retryAfter = (await response.json()).retry_after;
            console.log(`Hız sınırına takıldı. ${retryAfter}ms bekleniyor...`);
            setTimeout(() => sendMessage(token), retryAfter);
        } else if (response.ok) {
            console.log(`Mesaj başarıyla gönderildi: ${token.substring(0, 10)}...`);
            // Render'da ban yememek için çok kısa bir bekleme (Örn: 100ms)
            setTimeout(() => sendMessage(token), 100); 
        } else {
            console.log(`Hata oluştu (${response.status}): Token geçersiz olabilir.`);
        }
    } catch (error) {
        console.error("İstek hatası:", error);
    }
};

// Her token için işlemi başlat
TOKENS.forEach(token => {
    sendMessage(token);
});

// Render'ın kapanmaması için basit bir HTTP sunucusu (Opsiyonel ama önerilir)
const http = require('http');
http.createServer((req, res) => res.end("Bot Calisiyor!")).listen(process.env.PORT || 3000);
