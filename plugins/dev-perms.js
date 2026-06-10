import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const PLUGINS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)))
const pendingApprovals = {}
const pendingRejection = {}

const STAFF_GROUP = "120363403774208578@g.us" 

const isDev = (jid) =>
  (global.db.data.pluginPerms?.[jid] ?? []).includes('developer')

const isOwner = (jid) =>
  global.owner.some(([num]) => num === jid.split('@')[0])

const fixFilename = (name) => {
  if (!name) return null
  name = name.trim()
  if (!name.endsWith('.js')) name += '.js'
  return name
}

const notifyOwners = async (conn, approval) => {
  const { id, type, filename, code, devNum, devName } = approval
  const label = { save: 'SALVARE', edit: 'MODIFICARE', delete: 'ELIMINARE' }[type]

  await conn.sendMessage(STAFF_GROUP, {
    text:
`⚠️ *RICHIESTA DEVELOPER*

👤 Developer: *${devName}* (+${devNum})
🛠️ Azione: *${label}*
📄 File: *${filename}*

📝 Codice:
\`\`\`
${code ? code.slice(0, 3500) : 'Nessun codice (eliminazione)'}
\`\`\`

🆔 ID Approvazione: \`${id}\``,

    buttons: [
      { buttonId: `.approva ${id}`, buttonText: { displayText: '✅ Approva' }, type: 1 },
      { buttonId: `.rifiuta ${id}`, buttonText: { displayText: '❌ Rifiuta' }, type: 1 }
    ],
    headerType: 1
  })
}

let handler = async (m, { conn, text, command }) => {
  const cmd = command?.toLowerCase()

  if (cmd === 'approva' || cmd === 'rifiuta') {
    if (!isOwner(m.sender)) return

    const approvalId = text?.trim()
    if (!approvalId) return m.reply('❌ ID approvazione mancante.')

    const approval = pendingApprovals[approvalId]
    if (!approval) return m.reply(`❌ Nessuna richiesta trovata con ID *${approvalId}*`)

    if (cmd === 'approva') {
      const { type, filename, code, devJid } = approval
      const filePath = path.join(PLUGINS_DIR, filename)
      try {
        if (type === 'save' || type === 'edit') fs.writeFileSync(filePath, code, 'utf8')
        else if (type === 'delete' && fs.existsSync(filePath)) fs.unlinkSync(filePath)

        delete pendingApprovals[approvalId]

        await conn.sendMessage(STAFF_GROUP, {
          text: `✅ Plugin *${filename}* approvato.`
        })

        await conn.sendMessage(devJid, {
          text:
`✅ *Richiesta Approvata!*

📄 Plugin: *${filename}*
👮 Approvato da uno staff`
        })
      } catch (e) {
        m.reply('❌ Errore: ' + e.message)
      }
      return
    }

    if (cmd === 'rifiuta') {
      pendingRejection[m.sender] = approvalId
      return await conn.sendMessage(m.chat, {
        text: `✏️ Scrivi il motivo del rifiuto per *${approvalId}*`,
        buttons: [
          { buttonId: `.annullarifiuto`, buttonText: { displayText: '❌ Annulla' }, type: 1 }
        ],
        headerType: 1
      }, { quoted: m })
    }
  }

  if (cmd === 'annullarifiuto') {
    delete pendingRejection[m.sender]
    return m.reply('🗑️ Rifiuto annullato.')
  }

  if (!isDev(m.sender))
    return m.reply('❌ Non hai il ruolo developer.')

  const type = cmd === 'devsave' ? 'save' : cmd === 'devedit' ? 'edit' : 'delete'

  let filename, code

  if (m.quoted) {
    filename = fixFilename(text?.trim().split('\n')[0])
    code = m.quoted.text || m.quoted.body || ''
  } else {
    const lines = text?.trim().split('\n') || []
    filename = fixFilename(lines[0])
    code = lines.slice(1).join('\n').replace(/```/g, '').trim()
  }

  if (!filename)
    return m.reply(`❌ Formato non valido`)

  if ((type === 'save' || type === 'edit') && !code)
    return m.reply('❌ Nessun codice trovato.')

  const protectedPluginNames = new Set(['crediti'])
  const baseName = path.basename(filename, '.js').toLowerCase()
  if (protectedPluginNames.has(baseName))
    return m.reply('❌ Questo plugin è protetto e non può essere salvato, modificato o eliminato.')

  const filePath = path.join(PLUGINS_DIR, filename)
  if (type === 'edit' && !fs.existsSync(filePath))
    return m.reply(`❌ Il plugin non esiste.`)
  if (type === 'delete' && !fs.existsSync(filePath))
    return m.reply(`❌ Il plugin non esiste.`)

  const devNum = m.sender.split('@')[0]
  const devName = m.pushName || devNum
  const id = `DEV-${Date.now()}`

  pendingApprovals[id] = { id, type, filename, code, devJid: m.sender, devNum, devName }

  await notifyOwners(conn, pendingApprovals[id])

  return m.reply(
`📨 Richiesta inviata nel gruppo staff

📄 File: *${filename}*
🆔 ID: ${id}`)
}

handler.all = async function (m) {
  if (!m.text || m.fromMe) return
  if (!pendingRejection[m.sender]) return

  const approvalId = pendingRejection[m.sender]
  const motivo = m.text.trim()
  delete pendingRejection[m.sender]

  const approval = pendingApprovals[approvalId]
  if (!approval) return
  delete pendingApprovals[approvalId]

  await this.sendMessage(STAFF_GROUP, {
    text: `❌ Rifiutato plugin *${approval.filename}*\nMotivo: ${motivo}`
  })

  await this.sendMessage(approval.devJid, {
    text:
`❌ *Richiesta Rifiutata*

📄 Plugin: *${approval.filename}*
📝 Motivo: ${motivo}`
  })
}

handler.command = /^(devsave|devedit|devdp|approva|rifiuta|annullarifiuto)$/i
export default handler