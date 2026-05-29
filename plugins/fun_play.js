import axios from 'axios'
import yts from 'yt-search'

const API_BASE = 'https://chatunity-api.it'
const API_KEY = '3d986821d0cc62359f0fe5acac95898b77513ca1db779102cb00c1b23875a54a'

function cleanFileName(name = 'file') {
  return String(name).replace(/[\\/:*?"<>|]/g, '').trim().slice(0, 80) || 'file'
}

function isYouTubeUrl(text) {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(text)
}

function normalizeYtUrl(text) {
  try {
    if (!isYouTubeUrl(text)) return null

    const u = new URL(text)
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace('/', '').trim()
      return id ? `https://www.youtube.com/watch?v=${id}` : text
    }

    return text
  } catch {
    return text
  }
}

async function resolveVideo(text) {
  const search = await yts(text)
  const vid = search?.videos?.[0] || null
  const url = vid?.url || text

  return { vid, url }
}

async function downloadFromApi(query, format = 'mp3') {
  const url = `${API_BASE}/download?query=${encodeURIComponent(query)}&format=${format}`

  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 300000,
    maxRedirects: 5,
    headers: {
      Authorization: `Bearer ${API_KEY}`
    },
    validateStatus: status => status >= 200 && status < 300
  })

  const contentType = res.headers['content-type'] || ''
  const data = Buffer.from(res.data)

  if (!data || !data.length) {
    throw new Error('L\'API ha mandato un file vuoto')
  }

  console.log('[play] download ok', {
    format,
    bytes: data.length,
    contentType
  })

  return data
}

async function handler(m, { conn, args, command, usedPrefix }) {
  const text = args.join(' ').trim()
  const prefix = usedPrefix || global.prefissoComandi || global.prefix || '.'
  const isAudioCmd = command === 'playaud'
  const isVideoCmd = command === 'playvid'

  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: `💡 𝐒𝐂𝐑𝐈𝐕𝐈: ${prefix}${command} 𝐂𝐀𝐍𝐙𝐎𝐍𝐄 - 𝐀𝐑𝐓𝐈𝐒𝐓𝐀 𝐎 𝐔𝐑𝐋 𝐘𝐎𝐔𝐓𝐔𝐁𝐄` },
      { quoted: m }
    )
  }

  try {
    let vid = null
    let url = text

    if (isYouTubeUrl(text)) {
      const normalizedUrl = normalizeYtUrl(text)
      const resolved = await resolveVideo(normalizedUrl || text)
      vid = resolved.vid
      url = resolved.url
    } else {
      const resolved = await resolveVideo(text)
      vid = resolved.vid
      url = resolved.url
    }

    if (!url) {
      return conn.sendMessage(
        m.chat,
        { text: '⚠️ 𝐍𝐎𝐍 𝐇𝐎 𝐓𝐑𝐎𝐕𝐀𝐓𝐎 𝐐𝐔𝐄𝐒𝐓𝐀 𝐂𝐀𝐍𝐙𝐎𝐍𝐄.' },
        { quoted: m }
      )
    }

    if (command === 'play') {
      const title = vid?.title || text
      const thumb = vid?.thumbnail || 'https://picsum.photos/seed/chatunityplay/720/405'
      const views = vid?.views ? Number(vid.views).toLocaleString('it-IT') : 'N/D'
      const duration = vid?.timestamp || 'N/D'

      return await conn.sendMessage(
        m.chat,
        {
          image: { url: thumb },
          caption: [
            '╭━━━『 🎧 𝐏𝐋𝚫𝜳 』━━━⬣',
            `┆ 📌 𝐓𝐈𝐓𝚯𝐋𝚯: ${title}`,
            `┆ ⏱️ 𝐃𝐔𝐑𝚫𝐓𝐀: ${duration}`,
            `┆ 👀 𝐕𝐈𝚵𝐖𝐒: ${views}`,
            '╰━━━━━━━━━━━━━━⬣',
            '',
            '𝐒𝐄𝐋𝐄𝐙𝐈𝚯𝐍𝐀 𝐅𝚯𝐑𝐌𝐀𝐓𝚯:'
          ].join('\n').trim(),
          footer: '𝐀𝐏𝐈 𝐂𝐇𝐀𝐓𝐔𝐍𝐈𝐓𝐘',
          buttons: [
            {
              buttonId: `${prefix}playaud ${url}`,
              buttonText: { displayText: '𝐀𝐔𝐃𝐈𝚯' },
              type: 1
            },
            {
              buttonId: `${prefix}playvid ${url}`,
              buttonText: { displayText: '𝐕𝐈𝐃𝐄𝚯' },
              type: 1
            }
          ],
          headerType: 4
        },
        { quoted: m }
      )
    }

    await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

    await conn.sendMessage(
      m.chat,
      {
        text: `⏳ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐃𝐄𝐋 ${isAudioCmd ? '𝐅𝐈𝐋𝐄 𝐀𝐔𝐃𝐈𝐎' : '𝐅𝐈𝐋𝐄 𝐕𝐈𝐃𝐄𝐎'}...`
      },
      { quoted: m }
    )

    const mediaBuffer = await downloadFromApi(url, isAudioCmd ? 'mp3' : 'mp4')

    if (isAudioCmd) {
      await conn.sendMessage(
        m.chat,
        {
          audio: mediaBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${cleanFileName(vid?.title || 'audio')}.mp3`,
          ptt: false
        },
        { quoted: m }
      )
    } else if (isVideoCmd) {
      await conn.sendMessage(
        m.chat,
        {
          video: mediaBuffer,
          mimetype: 'video/mp4',
          caption: `✅ 𝐒𝐂𝐀𝐑𝐈𝐂𝐀𝐓𝐎: ${vid?.title || '𝐕𝐈𝐃𝐄𝐎'}`
        },
        { quoted: m }
      )
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  } catch (e) {
    console.error('[play error]', e?.response?.data || e)

    let msg = e?.message || 'server non raggiungibile.'
    if (e?.response?.status === 401) msg = 'Chiave API non valida.'
    else if (e?.response?.status === 413) msg = 'File troppo grande.'
    else if (e?.response?.status === 502) msg = 'API temporaneamente non raggiungibile (502).'
    else if (e?.code === 'ECONNABORTED') msg = 'Timeout API: il download ha impiegato troppo tempo.'

    await conn.sendMessage(
      m.chat,
      { text: `❗ 𝐄𝐑𝐑𝐎𝐑𝐄: ${msg}` },
      { quoted: m }
    )
  }
}

handler.help = ['play <nome>', 'playaud <nome/url>', 'playvid <nome/url>']
handler.tags = ['downloader']
handler.command = /^(play|playaud|playvid)$/i

export default handler