//𝐌𝐞𝐧𝐮 𝐋𝐚𝐬𝐭𝐅𝐌

let handler = async (m, { conn, usedPrefix }) => {
  const sender = m.sender.split('@')[0]

  const menu = `
╭───────────────╮
│ 🎧 *𝐌𝐄𝐍𝐔 𝐋𝐀𝐒𝐓.𝐅𝐌*
├────────────────
│ ⮕ ${usedPrefix}setuser <username>
│ ⮕ ${usedPrefix}cur
│ ⮕ ${usedPrefix}topartists
│ ⮕ ${usedPrefix}topalbums
│ ⮕ ${usedPrefix}toptracks
│ ⮕ ${usedPrefix}cronologia
╰───────────────╯

🎵 𝐔𝐭𝐞𝐧𝐭𝐞: @${sender}
🤖 𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭 𝐕𝟑
`.trim()

  const buttons = [
    { buttonId: `${usedPrefix}cur`, buttonText: { displayText: "🎧 𝐁𝐑𝐀𝐍𝐎 𝐀𝐓𝐓𝐔𝐀𝐋𝐄" }, type: 1 },
    { buttonId: `${usedPrefix}topartists`, buttonText: { displayText: "🎤 𝐓𝐎𝐏 𝐀𝐑𝐓𝐈𝐒𝐓𝐈" }, type: 1 },
    { buttonId: `${usedPrefix}topalbums`, buttonText: { displayText: "💿 𝐓𝐎𝐏 𝐀𝐋𝐁𝐔𝐌" }, type: 1 },
    { buttonId: `${usedPrefix}toptracks`, buttonText: { displayText: "🎵 𝐓𝐎𝐏 𝐓𝐑𝐀𝐂𝐂𝐄" }, type: 1 },
    { buttonId: `${usedPrefix}cronologia`, buttonText: { displayText: "📜 𝐂𝐑𝐎𝐍𝐎𝐋𝐎𝐆𝐈𝐀" }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    text: menu,
    footer: "🎧 𝐌𝐞𝐧𝐮 𝐋𝐚𝐬𝐭.𝐅𝐌",
    buttons,
    headerType: 4,
    mentions: [m.sender]
  })
}

handler.command = /^(lastfm|menulastfm)$/i
handler.tags = ['lastfm']
handler.help = ['lastfm']

export default handler
