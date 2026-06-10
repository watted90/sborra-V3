let handler = async (m, { conn, args, text }) => {
  if (!text && !m.quoted) {
    return m.reply(`
🎨 *Sistema Cornici*

Usa: .cornice <tipo> <testo>

Tipi disponibili:
━━━━━━━━━━━━━━━━━
├ .cornice 1 <testo>
├ .cornice 2 <testo>
├ .cornice 3 <testo>
├ .cornice 4 <testo>
├ .cornice 5 <testo>
└ .cornice 6 <testo>

Esempio: .cornice 1 Ciao!
    `)
  }

  let tipo = args[0] || '1'
  let testo = args.slice(1).join(' ') || m.quoted?.text || text

  if (!testo) return m.reply('❌ Inserisci un testo!')

  const cornici = {
    '1': (t) => `╔═══════════════╗\n║ ${t}\n╚═══════════════╝`,
    '2': (t) => `╭━━━━━━━━━━━━━━╮\n┃ ${t}\n╰━━━━━━━━━━━━━━╯`,
    '3': (t) => `┏━━━━━━━━━━━━━━┓\n┃ ${t}\n┗━━━━━━━━━━━━━━┛`,
    '4': (t) => `▌▌▌ ${t} ▌▌▌`,
    '5': (t) => `◆◇◆ ${t} ◇◆◇`,
    '6': (t) => `┋┋┋ ${t} ┋┋┋`
  }

  let risultato = cornici[tipo] ? cornici[tipo](testo) : cornici['1'](testo)

  m.reply(risultato)
}

handler.help = ['cornice']
handler.tags = ['fun']
handler.command = /^cornice$/i

export default handler
