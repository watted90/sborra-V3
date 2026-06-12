//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { text }) => {
  let number
  if (m.quoted) {
    number = m.quoted.sender.split('@')[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  } else if (text) {
    number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  } else {
    return m.reply('Scrivi un numero o rispondi a un messaggio')
  }

  const clean = number.split('@')[0]

  // Controlla se è un owner del config
  const isConfigOwner = global.owner.some(([num]) => num === clean)
  if (!isConfigOwner) return m.reply('Non è rowner')

  // Verifica se l'owner è definito nel config.js (da proteggere)
  const configOwners = ['393892016995'] // Owner principali del config
  if (configOwners.includes(clean)) {
    return m.reply(`❌ Non puoi rimuovere un owner definito nel config.js`)
  }

  // Rimuovi dagli owner globali
  global.owner = global.owner.filter(([num]) => num !== clean)

  // Rimuovi dal database se esiste
  if (global.db.data.owners) {
    global.db.data.owners = global.db.data.owners.filter(v => v !== number)
  }

  m.reply(`❌ *${clean}* rimosso da rowner`)
}

handler.command = /^delowner$/i
handler.rowner = true
export default handler