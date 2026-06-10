//Plugin by Gab, Lucifero & 𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭 𝐕𝟑

let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return m.reply('𝐐𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐚 𝐬𝐨𝐥𝐨 𝐧𝐞𝐢 𝐠𝐫𝐮𝐩𝐩𝐢.')
  if (!m.fromMe) return m.reply('𝐒𝐨𝐥𝐨 𝐢𝐥 𝐝𝐞𝐯 𝐩𝐮𝐨̀ 𝐮𝐬𝐞𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.')

  try {
    let meta = await conn.groupMetadata(m.chat)
    let participants = meta.participants
    let admins = participants.filter(p => p.admin)
    
    let message = '╔════『 𝐍𝐔𝐊𝐄 』════\n'
    message += '║ Nuke avviato...\n'
    message += '║ Rimozione amministratori in corso\n'
    message += '╚════════════════\n\n'
    
    for (let admin of admins) {
      if (admin.jid === conn.user.jid) continue
      await conn.groupParticipantsUpdate(m.chat, [admin.jid], 'demote').catch(() => {})
    }
    
    message += `✅ Demotati ${admins.length - 1} amministratori\n`
    message += `⚠️ Nuke completato!`
    
    m.reply(message)
    
  } catch (e) {
    console.error(e)
    m.reply('❌ Errore durante il nuke: ' + e.message)
  }
}

handler.help = ['nuke']
handler.tags = ['owner']
handler.command = /^nuke$/i
handler.owner = true

export default handler
