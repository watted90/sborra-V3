//Plugin by Gab, Lucifero & 333 staff



let bombaInCorso = {};

const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: 'Innesca un\'altra!', id: `.bomba` })
}];

let handler = async (m, { conn, text, command }) => {
    let chat = m.chat;

    if (command === 'bomba') {
        if (bombaInCorso[chat]) return m.reply('⚠️ C\'è già una bomba innescata! Scappa! 🏃‍♂️');

        const cooldownKey = `bomba_${chat}`;
        const lastGame = global.cooldowns?.[cooldownKey] || 0;
        const now = Date.now();
        if (now - lastGame < 5000) return m.reply(`⏳ Aspetta un attimo, la polvere da sparo deve ancora depositarsi!`);

        global.cooldowns = global.cooldowns || {};
        global.cooldowns[cooldownKey] = now;

        let durata = Math.floor(Math.random() * (35 - 15 + 1)) + 15; 
        let scadenza = Date.now() + (durata * 1000);

        bombaInCorso[chat] = {
            vittima: m.sender,
            passaggi: [],
            scadenza: scadenza,
            timer: setTimeout(() => esplosione(chat, conn, m), durata * 1000)
        };

        let pName = `@${m.sender.split('@')[0]}`;
        let startCaption = `╔════════════════════╗\n`;
        startCaption += `║      *𝐒𝐁𝐎𝐑𝐑𝐀 𝐁𝐎𝐓 - 𝐁𝐎𝐌𝐁𝐀*      ║\n`;
        startCaption += `╚═══════════════════════╝\n\n`;
        startCaption += `💣 *𝐁𝐎𝐌𝐁𝐀 𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐀!*\n\n`;
        startCaption += `👤 𝐕𝐢𝐭𝐭𝐢𝐦𝐚: ${pName}\n`;
        startCaption += `⏳ 𝐓𝐞𝐦𝐩𝐨 𝐫𝐞𝐬𝐭𝐚𝐧𝐭𝐞: *${durata}s*\n`;
        startCaption += `🧨 𝐔𝐬𝐚: *𝐩𝐚𝐬𝐬𝐚 @utente* 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐜𝐨𝐧 *𝐩𝐚𝐬𝐬𝐚\n`;
        startCaption += `❌ 𝐈𝐋. 𝐁𝐎𝐓 𝐍𝐎𝐍 𝐏𝐔𝐎̀ 𝐑𝐈𝐂𝐄𝐕𝐄𝐑𝐄 𝐁𝐎𝐌𝐁𝐄`;

        return conn.sendMessage(chat, { text: startCaption, mentions: [m.sender], footer: '𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭 𝐕𝟑' }, { quoted: m });
    }
};

handler.before = async function (m, { conn }) {
    let chat = m.chat;
    if (!bombaInCorso[chat] || !m.text) return;

    let b = bombaInCorso[chat];
    let contenuto = m.text.toLowerCase().trim();

    if (m.sender !== b.vittima) return; 
    if (!contenuto.startsWith('passa')) return;

    let target = null;
    if (m.mentionedJid && m.mentionedJid[0]) {
        target = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        target = m.quoted.sender;
    }

    if (!target || target === m.sender) return; 
    if (target === conn.user.jid) return m.reply('❌ 𝐈𝐋 𝐁𝐎𝐓 𝐍𝐎𝐍 𝐑𝐈𝐂𝐄𝐕𝐄 𝐁𝐎𝐌𝐁𝐄');

    clearTimeout(b.timer);
    let tempoRimanente = b.scadenza - Date.now();

    if (tempoRimanente <= 500) return;

    if (!b.passaggi.includes(m.sender)) b.passaggi.push(m.sender);

    b.vittima = target;
    let pName = `@${target.split('@')[0]}`;

    let conferma = `💣 *𝐁𝐎𝐌𝐁𝐀 𝐏𝐀𝐒𝐒𝐀𝐓𝐀!* 💣\n\n`;
    conferma += `*𝐋'𝐎𝐑𝐃𝐈𝐆𝐍𝐎 𝐎𝐑𝐀 𝐄̈ 𝐈𝐍 𝐌𝐀𝐍𝐎 𝐀  ${pName}!*\n`;
    conferma += `*🧨 𝐓𝐈𝐂 𝐓𝐀𝐂 𝐈𝐋 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐎𝐑𝐑𝐄...*`;

    b.timer = setTimeout(() => esplosione(chat, conn, m), tempoRimanente);

    await conn.sendMessage(chat, { text: conferma, mentions: [target] }, { quoted: m });
    return true; 
};

async function esplosione(chatId, conn, m) {
    let b = bombaInCorso[chatId];
    if (!b) return;

    let vTag = `@${b.vittima.split('@')[0]}`;
    if (!global.db.data.users) global.db.data.users = {};

    let penale = 15;
    if (!global.db.data.users[b.vittima]) global.db.data.users[b.vittima] = { money: 0 };
    let saldoVittima = global.db.data.users[b.vittima].money || 0;
    global.db.data.users[b.vittima].money = Math.max(0, saldoVittima - penale);

    let finale = `╔════════════════════╗\n`;
    finale += `║      *𝐁𝐎𝐎𝐌*     ║\n`;
    finale += `╚═══════════════════════╝\n\n`;
    finale += `💥 *𝐄𝐒𝐏𝐋𝐎𝐒𝐈𝐎𝐍𝐄!*\n\n`;
    finale += `💀 𝐋𝐀. 𝐁𝐎𝐌𝐁𝐀 𝐄̀ 𝐄𝐒𝐏𝐋𝐎𝐒𝐀 𝐍𝐄𝐋𝐋𝐄 𝐌𝐀𝐍𝐈 𝐃𝐈 ${vTag}!\n`;
    finale += `💸 𝐇𝐀𝐈 𝐏𝐄𝐑𝐒𝐎: *-${penale}€*\n\n`;

    if (b.passaggi.length > 0) {
        finale += `🏆 *𝐒𝐎𝐏𝐑𝐀𝐕𝐕𝐈𝐒𝐒𝐔𝐓𝐈 𝐏𝐑𝐄𝐌𝐈𝐀𝐓𝐈:*\n`;
        let premiati = [...new Set(b.passaggi)];
        for (let jid of premiati) {
            if (jid === b.vittima) continue;
            let premio = Math.floor(Math.random() * 20) + 10;

            if (!global.db.data.users[jid]) global.db.data.users[jid] = { money: 0 };
            global.db.data.users[jid].money = (global.db.data.users[jid].money || 0) + premio;

            finale += `• @${jid.split('@')[0]} +${premio}€\n`;
        }
        finale += `\n`;
    }

    await conn.sendMessage(chatId, { 
        text: finale, 
        mentions: [b.vittima, ...b.passaggi],
        footer: '*𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭 𝐕𝟑*',
        interactiveButtons: playAgainButtons()
    });

    delete bombaInCorso[chatId];
}

handler.help = ['bomba'];
handler.tags = ['giochi'];
handler.command = /^(bomba)$/i;
handler.group = true;
handler.register = false;

export default handler;
