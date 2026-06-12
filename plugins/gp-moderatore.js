const handler = async (m, { conn, args, groupMetadata, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi!')

    let chat = global.db.data.chats[m.chat]
    if (!chat.moderators) chat.moderators = []

    if (!args[0]) {
        let moderators = chat.moderators
            .map(jid => {
                const user = groupMetadata.participants.find(p => p.id === jid)
                return `✓ @${jid.split('@')[0]}`
            })
            .join('\n') || '❌ Nessun moderatore'

        return m.reply(`
╭─────────────────╮
┃  🛡️ MODERATORI GRUPPO
┃━━━━━━━━━━━━━━━━━
┃${moderators}
╰─────────────────╯
        `.trim())
    }

    const targetUser = m.mentionedJid?.[0] || m.quoted?.sender
    if (!targetUser) return m.reply('❌ Menziona o rispondi a chi vuoi gestire!')

    const isModeratorNow = chat.moderators.includes(targetUser)

    if (command === 'addmod') {
        if (isModeratorNow) return m.reply(`❌ @${targetUser.split('@')[0]} è già un moderatore!`, undefined, { mentions: [targetUser] })

        chat.moderators.push(targetUser)
        m.reply(`✅ @${targetUser.split('@')[0]} è stato promosso a moderatore 🛡️`, undefined, { mentions: [targetUser] })
    } else if (command === 'delmod') {
        if (!isModeratorNow) return m.reply(`❌ @${targetUser.split('@')[0]} non è un moderatore!`, undefined, { mentions: [targetUser] })

        chat.moderators = chat.moderators.filter(jid => jid !== targetUser)
        m.reply(`✅ @${targetUser.split('@')[0]} è stato retrocesso da moderatore`, undefined, { mentions: [targetUser] })
    }
}

handler.help = ['addmod @utente', 'delmod @utente', 'moderatori']
handler.tags = ['admin']
handler.command = /^(addmod|delmod|moderatori)$/i
handler.group = true
handler.admin = true

export default handler
