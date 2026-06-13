import yts from 'yt-search'
import { exec, execFile } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

global.playChoice = global.playChoice || {}
global.pendingLyrics = global.pendingLyrics || {}
global.lyricsRequest = global.lyricsRequest || {}

const execPromise = (cmd) => new Promise((resolve, reject) => {
  exec(cmd, { maxBuffer: 1024 * 1024 * 10, timeout: 60000 }, (err, stdout, stderr) => {
    if (err) reject(new Error(stderr || err.message))
    else resolve(stdout)
  })
})

const execFilePromise = (file, args) => new Promise((resolve, reject) => {
  execFile(file, args, { maxBuffer: 1024 * 1024 * 10, timeout: 60000 }, (err, stdout, stderr) => {
    if (err) reject(new Error(stderr || err.message))
    else resolve(stdout)
  })
})

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (command === "play") {

    if (!text) return m.reply("🎧 𝐒𝐜𝐫𝐢𝐯𝐢 𝐢𝐥 𝐭𝐢𝐭𝐨𝐥𝐨!")

    let search = await yts(text)
    let video = search.videos[0]

    if (!video) return m.reply("❌ Nessun risultato")

    global.playChoice[m.sender] = video

    return conn.sendMessage(m.chat, {
      text:
`╔════『𝐏𝐋𝚫𝜳』════
║
║ 🎶 𝐓𝐈𝐓𝚯𝐋𝚯: ${video.title}
║ 🕗 𝐃𝐔𝐑𝐀𝐓𝐀: ${video.timestamp}
║ 👀 𝐕𝐈𝐄𝐖𝐒: ${video.views}
║
╚══════════════`,
      footer: '𝐒𝐄𝐋𝐄𝐙𝐈𝚯𝐍𝐀 𝐅𝚯𝐑𝐌𝐀𝐓𝚯:',
      buttons: [
        { buttonId: ".play_audio", buttonText: { displayText: "🎧 𝐀𝐔𝐃𝐈𝚯" }, type: 1 },
        { buttonId: ".play_video", buttonText: { displayText: "🎥 𝐕𝐈𝐃𝐄𝚯" }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  let video = global.playChoice[m.sender]
  if (!video) return m.reply("❌ 𝐍𝐎𝐍 𝐂'𝐄̀ 𝐍𝐄𝐒𝐒𝐔𝐍𝐀 𝐂𝐀𝐍𝐙𝐎𝐍𝐄")

  // AUDIO
  if (command === "play_audio") {

    await m.reply(`
⏳ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐃𝐄𝐋 𝐅𝐈𝐋𝐄 𝐑𝐈𝐂𝐇𝐈𝐄𝐒𝐓𝐎

> 𝐒𝐁𝐎𝐑𝐑𝐀 𝐁𝐎𝐓 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑
`)

    let file = `./tmp_${Date.now()}.mp3`
    let temp = `./tmp_${Date.now()}.m4a`

    try {
      // Scarica SEMPRE in m4a (formato garantito)
      await execFilePromise('/usr/local/bin/yt-dlp', [
        '--cookies', 'cookies.txt',
        '--extractor-args', 'youtube:player_client=android',
        '--no-mtime',
        '--ignore-errors',
        '--no-warnings',
        '--no-playlist',
        '-f', 'bestaudio[ext=m4a]/bestaudio',
        '-o', temp,
        video.url
      ])

      // Converti in mp3
      await execPromise(
        `/usr/bin/ffmpeg -y -i "${temp}" -vn -c:a libmp3lame -b:a 128k "${file}"`
      )

      fs.unlinkSync(temp)

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(file),
        mimetype: 'audio/mpeg'
      }, { quoted: m })

      fs.unlinkSync(file)

      global.lyricsRequest[m.sender] = video.title

      if (global.pendingLyrics[m.sender]) clearTimeout(global.pendingLyrics[m.sender])
      global.pendingLyrics[m.sender] = setTimeout(() => {
        delete global.pendingLyrics[m.sender]
        delete global.lyricsRequest[m.sender]
      }, 15000)

      const pulsanti = [
        ['✅ 𝐒𝐢', `${usedPrefix}lyrics_yes`]
      ]

      await conn.sendButton(
        m.chat,
        `📜 Vuoi il testo?\n\n*${video.title}*`,
        `Hai 15 secondi`,
        null,
        pulsanti,
        m
      )

      delete global.playChoice[m.sender]

    } catch (e) {
      console.error('Play audio error:', e)
      if (fs.existsSync(file)) fs.unlinkSync(file)
      if (fs.existsSync(temp)) fs.unlinkSync(temp)
      m.reply("❌ Errore nel download audio")
    }
  }

  // VIDEO
  if (command === "play_video") {

    if (video.seconds > 480)
      return m.reply("❌ Max 8 minuti")

    await m.reply("🎬 𝐒𝐂𝐀𝐑𝐈𝐂𝐎 𝐈𝐋 𝐅𝐈𝐋𝐄 𝐑𝐈𝐂𝐇𝐈𝐄𝐒𝐓𝐎\n> 𝐒𝐁𝐎𝐑𝐑𝐀 𝐁𝐎𝐓 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑")

    const ts  = Date.now()
    const raw = path.join(os.tmpdir(), `vid_raw_${ts}.mp4`)
    const out = path.join(os.tmpdir(), `vid_out_${ts}.mp4`)

    try {

      await execPromise(
        `/usr/local/bin/yt-dlp --no-playlist ` +
        `--cookies cookies.txt ` +
        `--extractor-args "youtube:player_client=android" ` +
        `--no-mtime --ignore-errors --no-warnings ` +
        `-f "bestvideo[vcodec^=avc1][height<=480]+bestaudio[acodec^=mp4a]/best[vcodec^=avc1][height<=480]/best[height<=480]" ` +
        `--merge-output-format mp4 --ffmpeg-location /usr/bin/ffmpeg ` +
        `--no-part --retries 3 ` +
        `-o "${raw}" "${video.url}"`
      )

      await execPromise(
        `/usr/bin/ffmpeg -y -i "${raw}" ` +
        `-c:v libx264 -preset ultrafast -crf 30 ` +
        `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ` +
        `-c:a aac -b:a 96k -movflags +faststart "${out}"`
      )

      fs.unlinkSync(raw)

      const sizeMB = fs.statSync(out).size / (1024 * 1024)
      if (sizeMB > 64) {
        fs.unlinkSync(out)
        return m.reply("❌ 𝐕𝐈𝐃𝐄𝐎 𝐓𝐑𝐎𝐏𝐏𝐎 𝐆𝐑𝐀𝐍𝐃𝐄!")
      }

      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(out),
        mimetype: 'video/mp4',
        caption: `🎬 ${video.title}`
      }, { quoted: m })

      fs.unlinkSync(out)
      delete global.playChoice[m.sender]

    } catch (e) {
      console.error('Play video error:', e)
      if (fs.existsSync(raw)) fs.unlinkSync(raw)
      if (fs.existsSync(out)) fs.unlinkSync(out)
      m.reply("❌ Errore nel download video")
    }
  }
}

handler.command = /^(play|play_audio|play_video)$/i
handler.help = ['play']
handler.tags = ['fun']

export default handler