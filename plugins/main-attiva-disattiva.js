import fetch from 'node-fetch';
import fs from 'fs';

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  const userName = m.pushName || 'Utente';

  const imgBuffer = fs.readFileSync('icone/333.jpg');

  const fake = {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: '𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭 𝐕𝟑'
    },
    message: {
      locationMessage: {
        name: '⚙️ 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐅𝐮𝐧𝐳𝐢𝐨𝐧𝐢',
        jpegThumbnail: imgBuffer.toString('base64'),
        vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭 𝐕𝟑;;;\nFN:𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭 𝐕𝟑\nEND:VCARD'
      }
    },
    participant: '0@s.whatsapp.net'
  }

  let isEnable = /true|enable|attiva|(turn)?on|1/i.test(command) || args[0] === '1';
  if (/disable|disattiva|off|0/i.test(command) || args[0] === '0') isEnable = false;

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
  global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];
  let bot = global.db.data.settings[conn.user.jid] || {};

  const catalogs = {
    security: ['antilink', 'antiporno', 'modoadmin','antispam','antimedia','antitrava'],
    protezione: ['antispam', 'antitoxic', 'antiBot', 'antivoip', 'antioneview', 'antitrava'],
    media: ['antimedia', 'antiporno', 'antigore'],
    full: ['antilink', 'antiporno', 'antigore', 'antispam', 'antitoxic', 'antiBot', 'antivoip', 'antioneview', 'antimedia', 'antilinktg', 'antilinkig', 'antilinktiktok', 'modoadmin', 'antitrava']
  };

  const adminFeatures = [
    { key: 'welcome', name: 'Welcome', desc: 'Messaggio di benvenuto' },
    { key: 'antimedia', name: 'AntiMedia', desc: 'Blocca foto e video a più visual' },
    { key: 'goodbye', name: 'Addio', desc: 'Messaggio di addio' },
    { key: 'antispam', name: 'Antispam', desc: 'Antispam' },
    { key: 'antitrava', name: 'AntiTrava', desc: 'Blocca messaggi trava e crash' },
    { key: 'antitoxic', name: 'Antitossici', desc: 'Avverte e rimuove per parolacce/insulti' },
    { key: 'antiBot', name: 'Antibot', desc: 'Rimuove eventuali bot indesiderati' },
    { key: 'antioneview', name: 'Antiviewonce', desc: 'Antiviewonce' },
    { key: 'rileva', name: 'Rileva', desc: 'Rileva eventi gruppo' },
    { key: 'antiporn', name: 'Antiporno', desc: 'Antiporno' },
    { key: 'antigore', name: 'Antigore', desc: 'Antigore' },
    { key: 'modoadmin', name: 'Soloadmin', desc: 'Solo gli admin possono usare i comandi' },
    { key: 'ai', name: 'IA', desc: 'Intelligenza artificiale' },
    { key: 'vocali', name: 'Siri', desc: 'Risponde con audio agli audio e msg ricevuti' },
    { key: 'antivoip', name: 'Antivoip', desc: 'Antivoip' },
    { key: 'antilinktg', name: 'AntiTelegram', desc: 'Blocca link Telegram con espulsione immediata' },
    { key: 'antilinkig', name: 'AntiInstagram', desc: 'Blocca link Instagram con warn' },
    { key: 'antilinktiktok', name: 'AntiTikTok', desc: 'Blocca link TikTok con warn' },
    { key: 'antilink', name: 'antilink', desc: 'antilink whatsapp' },
    { key: 'reaction', name: 'Reazioni', desc: 'Reazioni automatiche' },
    { key: 'bestemmiometro', name: 'Bestemmiometro', desc: 'Rileva e conta le bestemmie' }
  ];

  const ownerFeatures = [
    { key: 'antiprivato', name: 'Antiprivato', desc: 'Blocca chiunque scrive in pv al bot' },
    { key: 'soloCreatore', name: 'Solocreatore', desc: 'Solo il creatore puo usare i comandi' },
    { key: 'jadibotmd', name: 'Subbots', desc: 'Subbots' },
    { key: 'read', name: 'Lettura', desc: 'Il bot legge automaticamente i messaggi' },
    { key: 'anticall', name: 'Antichiamate', desc: 'Rifiuta automaticamente le chiamate' },
    { key: 'antinuke', name: 'AntiNuke', desc: 'Evita attacchi terroristici dai communites incalliti' }
  ];

  const toggleFeature = (type) => {
    let result = { type, status: '', success: false };
    const adminCheck = m.isGroup && !(isAdmin || isOwner || isROwner);
    const ownerOnly = !isOwner && !isROwner;

    const adminGuard = () => { result.status = '𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐚𝐝𝐦𝐢𝐧'; };
    const ownerGuard = () => { result.status = '𝐒𝐨𝐥𝐨 𝐩𝐞𝐫 𝐨𝐰𝐧𝐞𝐫!'; };
    const groupGuard = () => { result.status = '𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐮𝐭𝐢𝐥𝐢𝐳𝐳𝐚𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢'; };

    const setChat = (key) => {
      if (chat[key] === isEnable) { result.status = isEnable ? '𝐞̀ 𝐠𝐢𝐚̀ 𝐚𝐭𝐭𝐢𝐯𝐨.' : '𝐞̀ 𝐠𝐢𝐚̀ 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨.'; return; }
      chat[key] = isEnable;
      result.status = isEnable ? '𝐀𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨';
      result.success = true;
    };
    const setBot = (key) => {
      if (bot[key] === isEnable) { result.status = isEnable ? '𝐞̀ 𝐠𝐢𝐚̀ 𝐚𝐭𝐭𝐢𝐯𝐨.' : '𝐞̀ 𝐠𝐢𝐚̀ 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨.'; return; }
      bot[key] = isEnable;
      result.status = isEnable ? '𝐀𝐭𝐭𝐢𝐯𝐚𝐭𝐨' : '𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨';
      result.success = true;
    };

    switch (type) {
      case 'welcome': case 'benvenuto':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) { adminGuard(); break; }
        setChat('welcome'); break;
      case 'goodbye': case 'addio':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) { adminGuard(); break; }
        setChat('goodbye'); break;
      case 'antiprivato': case 'antipriv':
        if (ownerOnly) { ownerGuard(); break; }
        setBot('antiprivato'); break;
      case 'antilinkig':
        if (adminCheck) { adminGuard(); break; }
        setChat('antilinkig'); break;
      case 'antilinktg':
        if (adminCheck) { adminGuard(); break; }
        setChat('antilinktg'); break;
      case 'antilinktiktok':
        if (adminCheck) { adminGuard(); break; }
        setChat('antilinktiktok'); break;
      case 'read': case 'lettura':
        if (ownerOnly) { ownerGuard(); break; }
        setBot('read'); break;
      case 'anticall': case 'antichiamate':
        if (ownerOnly) { ownerGuard(); break; }
        setBot('anticall'); break;
      case 'solocreatore': case 'creatore':
        if (ownerOnly) { ownerGuard(); break; }
        setBot('soloCreatore'); break;
      case 'modoadmin': case 'soloadmin':
        if (adminCheck) { adminGuard(); break; }
        setChat('modoadmin'); break;
      case 'antimedia':
        if (!m.isGroup) { groupGuard(); break; }
        if (adminCheck) { adminGuard(); break; }
        setChat('antimedia'); break;
      case 'antibot':
        if (adminCheck) { adminGuard(); break; }
        setChat('antiBot'); break;
      case 'antivoip':
        if (adminCheck) { adminGuard(); break; }
        setChat('antivoip'); break;
      case 'antitoxic': case 'antitossici':
        if (adminCheck) { adminGuard(); break; }
        setChat('antitoxic'); break;
      case 'antioneview': case 'antiviewonce':
        if (adminCheck) { adminGuard(); break; }
        setChat('antioneview'); break;
      case 'reaction': case 'reazioni':
        if (adminCheck) { adminGuard(); break; }
        setChat('reaction'); break;
      case 'bestemmiometro': case 'bestemmie':
        if (adminCheck) { adminGuard(); break; }
        setChat('bestemmiometro'); break;
      case 'antispam':
        if (adminCheck) { adminGuard(); break; }
        setChat('antispam'); break;
      case 'antitrava':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (adminCheck) { adminGuard(); break; }
        setChat('antitrava'); break;
      case 'antinuke':
        if (!m.isGroup) { groupGuard(); break; }
        if (ownerOnly) { ownerGuard(); break; }
        setChat('antinuke'); break;
      case 'antiporn': case 'antiporno': case 'antinsfw':
        if (adminCheck) { adminGuard(); break; }
        setChat('antiporno'); break;
      case 'antigore':
        if (adminCheck) { adminGuard(); break; }
        setChat('antigore'); break;
      case 'ia': case 'ai':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) { adminGuard(); break; }
        setChat('ai'); break;
      case 'vocali': case 'siri':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) { adminGuard(); break; }
        setChat('vocali'); break;
      case 'subbots':
        if (ownerOnly) { ownerGuard(); break; }
        setBot('jadibotmd'); break;
      case 'detect': case 'rileva':
        if (!m.isGroup && !isOwner) { groupGuard(); break; }
        if (m.isGroup && !isAdmin && !isOwner && !isROwner) { adminGuard(); break; }
        setChat('rileva'); break;
      case 'antilink': case 'nolink':
        if (adminCheck) { adminGuard(); break; }
        setChat('antilink'); break;
      default:
        result.status = '𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐧𝐨𝐧 𝐫𝐢𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨, 𝐩𝐞𝐫 𝐯𝐞𝐝𝐞𝐫𝐞 𝐥𝐚 𝐥𝐢𝐬𝐭𝐚 𝐝𝐞𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢 𝐟𝐚𝐫𝐞 \'\'.𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐢\'\''; break;
    }
    return result;
  };

  const buildMessage = (result) => {
    let icon = result.success ? (isEnable ? '🟢' : '🔴') : result.status.includes('𝐠𝐢𝐚̀') ? '🟡' : '⚠️';
    let displayStatus = result.success ? (isEnable ? '𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐀' : '𝐃𝐈𝐒𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐀') : result.status;
    return `╔═══「 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 」═══✧\n║ 📌 *Funzione:* ${result.type}\n║ ${icon} *Stato:* ${displayStatus}\n║ 👤 *Admin:* ${userName}\n╚════════════════✧\n\n`;
  };

  const createSections = (features) => [
    { title: 'Attiva', rows: features.map(f => ({ title: f.name, description: f.desc, id: `${usedPrefix}attiva ${f.key}` })) },
    { title: 'Disattiva', rows: features.map(f => ({ title: f.name, description: f.desc, id: `${usedPrefix}disattiva ${f.key}` })) }
  ];

  if (!args.length) {
    const bot333 = 'icone/333.jpg';
    let cards = [
      {
        image: { url: bot333 },
        title: 'Impostazioni Admin',
        body: 'Gestisci le funzioni del gruppo selezionando attiva o disattiva.',
        footer: 'Sborra Bot',
        buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'Impostazioni gruppo', sections: createSections(adminFeatures) }) }]
      }
    ];

    if (isOwner || isROwner) {
      cards.push({
        image: { url: bot333 },
        title: 'Impostazioni Owner',
        body: 'Gestisci le funzioni proprietario selezionando attiva o disattiva.',
        footer: 'Sborra Bot',
        buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'Seleziona azione', sections: createSections(ownerFeatures) }) }]
      });
    }

    return conn.sendMessage(m.chat, {
      text: '*Sistema di gestione funzioni*',
      footer: 'Sborra Bot',
      cards
    }, { quoted: fake });
  }

  const firstArg = args[0].toLowerCase();
  if (catalogs[firstArg]) {
    if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
      return conn.sendMessage(m.chat, { text: '𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐞𝐫 𝐚𝐝𝐦𝐢𝐧' }, { quoted: fake });
    }
    const results = catalogs[firstArg].map(key => toggleFeature(key));
    const msg = results.map(buildMessage).join('').trim();
    return conn.sendMessage(m.chat, { text: msg }, { quoted: fake });
  }

  const results = args.map(arg => toggleFeature(arg.toLowerCase()));
  const summaryMessage = results.map(buildMessage).join('').trim();
  await conn.sendMessage(m.chat, { text: summaryMessage }, { quoted: fake });
};

handler.help = ['attiva', 'disattiva', 'enable', 'disable'];
handler.tags = ['main'];
handler.command = ['enable', 'disable', 'attiva', 'disabilita', 'on', 'off', '1', '0'];

export default handler;