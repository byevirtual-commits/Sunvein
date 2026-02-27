const axios = require('axios');

const tokens = process.env.TOKENS ? process.env.TOKENS.split(',') : [];
const channelIds = process.env.CHANNEL_IDS ? process.env.CHANNEL_IDS.split(',') : [];
const message = process.env.MESSAGE;

// Mavi renk kodu buraya eklendi
const MAVI = "\x1b[34m"; 
const NORMAL = "\x1b[0m";

async function baslat() {
    if (tokens.length === 0 || channelIds.length === 0 || !message) {
        console.log("Hata: Değişkenler eksik!");
        return;
    }

    while (true) {
        for (const token of tokens) {
            const t = token.trim();
            for (const channelId of channelIds) {
                const c = channelId.trim();
                try {
                    axios.post(`https://discord.com/api/v9/channels/${c}/messages`, 
                        { content: message }, 
                        { headers: { 'Authorization': t } }
                    ).then(res => {
                        if (res.status === 200 || res.status === 201) {
                            // YESIL yerine MAVI kullanıldı
                            console.log(`${MAVI}Mesaj Gönderildi (Kanal: ...${c.slice(-4)} | Token: ...${t.slice(-4)})${NORMAL}`);
                        }
                    }).catch(() => { /* Hataları gizle */ });
                } catch (e) { /* Hataları gizle */ }
            }
        }
        await new Promise(resolve => setTimeout(resolve, 50)); 
    }
}

baslat();
