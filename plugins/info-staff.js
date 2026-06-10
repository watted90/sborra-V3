//Plugin by Gab, Lucifero & 333 staff






let handler = async (m, { conn }) => {

const text = 
`╭─────────╮\n┃ 𝐈𝐍𝐅𝐎 𝐒𝐓𝐀𝐅𝐅 𝐒𝐁𝐎𝐑𝐑𝐀 𝐁𝐎𝐓
┃
┃ 👑 𝐎𝐖𝐍𝐄𝐑
┃ • 𝐃𝐢𝐞𝐡: wa.me/393892016995
┃━━━━━━━━━━━━━━
┃ 🌐 𝐋𝐈𝐍𝐊 𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌
┃ • 𝐃𝐢𝐞𝐡: https://www.instagram.com/dieh_quello_real__
┃━━━━━━━━━━━━━━
┃ 📲 𝐈 𝐍𝐎𝐒𝐓𝐑𝐈 𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌
┃ • 𝐃𝐢𝐞𝐡: *@viseonare*
┃━━━━━━━━━━━━━━
┃ 📧 𝐄𝐌𝐀𝐈𝐋
┃ • 𝐃𝐢𝐞𝐡:
┃━━━━━━━━━━━━━━
┃ 💻 𝐋𝐈𝐍𝐊 𝐆𝐈𝐓𝐇𝐔𝐁
┃ https://github.com/watted90/sborra-V3
┃━━━━━━━━━━━━━━
┃📺 𝐋𝐈𝐍𝐊 𝐂𝐀𝐍𝐀𝐋𝐄
┃https://whatsapp.com/channel/0029Vb6OBLP5fM5YMjXBFU3Z
╰─────────╯
`

const mentions = [
'393892016995@s.whatsapp.net'

]

await conn.sendMessage(m.chat, {
text,
mentions,
contextInfo: {
externalAdReply: {
title: '𝐒𝐓𝐀𝐅𝐅 𝐒𝐁𝐎𝐑𝐑𝐀 𝐁𝐎𝐓',
body: '𝐞𝐧𝐭𝐫𝐚 𝐧𝐞𝐥 𝐜𝐚𝐧𝐚𝐥𝐞 𝐝𝐢 𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭!',
sourceUrl: 'https://whatsapp.com/channel/0029Vb6OBLP5fM5YMjXBFU3Z',
mediaType: 1,
renderLargerThumbnail: true
}
}
}, { quoted: m })

m.react('👑')
}

handler.help = ['staff']
handler.tags = ['admin']
handler.command = ['staff']

export default handler