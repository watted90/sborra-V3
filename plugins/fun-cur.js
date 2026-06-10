
//𝐂𝐨𝐝𝐢𝐜𝐞 𝐝𝐢 𝐟𝐮𝐧-𝐜𝐮𝐫.𝐣𝐬

import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const USERS_FILE = path.join(__dirname, '..', 'lastfm_users.json')

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '{}', 'utf8')
}

const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 𝟓 𝐦𝐢𝐧𝐮𝐭𝐢

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
}

function getLastfmUsername(userId) {
  const users = loadUsers()
  return users[userId] || null
}

function setLastfmUsername(userId, username) {
  const users = loadUsers()
  users[userId] = username
  saveUsers(users)
}

const LASTFM_API_KEY = '36f859a1fc4121e7f0e931806507d5f9'

async function fetchWithCache(url) {
  const now = Date.now()
  const cached = cache.get(url)
  if (cached && now - cached.timestamp < CACHE_DURATION) return cached.data

  const res = await fetch(url)
  const json = await res.json()
  cache.set(url, { data: json, timestamp: now })
  return json
}

async function getUserInfo(username) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${username}&api_key=${LASTFM_API_KEY}&format=json`
  return (await fetchWithCache(url))?.user
}

async function getTrackInfo(username, artist, track) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&username=${username}&format=json`
  return (await fetchWithCache(url))?.track
}

async function getRecentTrack(username) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&limit=1`
  return (await fetchWithCache(url))?.recenttracks?.track?.[0]
}

async function getRecentTracks(username, limit = 10) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`
  return (await fetchWithCache(url))?.recenttracks?.track || []
}

async function getTopArtists(username, period = '7day', limit = 9) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&api_key=${LASTFM_API_KEY}&format=json&period=${period}&limit=${limit}`
  return (await fetchWithCache(url))?.topartists?.artist
}

async function getTopAlbums(username, period = '7day', limit = 9) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&api_key=${LASTFM_API_KEY}&format=json&period=${period}&limit=${limit}`
  return (await fetchWithCache(url))?.topalbums?.album
}

async function getTopTracks(username, period = '7day', limit = 9) {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&period=${period}&limit=${limit}`
  return (await fetchWithCache(url))?.toptracks?.track
}

const handler = async (m, { conn, args, usedPrefix, text, command }) => {

  if (command === 'setuser') {
    const username = text.trim()
    if (!username) {
      return conn.sendMessage(m.chat, { text: `❌ 𝐔𝐬𝐚: ${usedPrefix}setuser <username>` })
    }

    setLastfmUsername(m.sender, username)
    return conn.sendMessage(m.chat, { text: `✅ 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 *${username}* 𝐬𝐚𝐥𝐯𝐚𝐭𝐨!` })
  }

  const user = getLastfmUsername(m.sender)
  if (!user) {
    return conn.sendMessage(m.chat, {
      text: `🎵 *𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐋𝐚𝐬𝐭.𝐅𝐌 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚*\n\n@${m.sender.split('@')[0]}, 𝐮𝐬𝐚:\n${usedPrefix}setuser <username>`,
      mentions: [m.sender]
    })
  }

  if (command === 'cur') {
    const track = await getRecentTrack(user)
    if (!track) return conn.sendMessage(m.chat, { text: '❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐭𝐫𝐚𝐜𝐜𝐢𝐚 𝐭𝐫𝐨𝐯𝐚𝐭𝐚.' })

    const nowPlaying = track['@attr']?.nowplaying === 'true'
    const artist = track.artist?.['#text'] || '𝐀𝐫𝐭𝐢𝐬𝐭𝐚 𝐬𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨'
    const title = track.name || '𝐁𝐫𝐚𝐧𝐨 𝐬𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨'
    const album = track.album?.['#text'] || '𝐀𝐥𝐛𝐮𝐦 𝐬𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨'
    const image = track.image?.find(img => img.size === 'extralarge')?.['#text'] || null

    const info = await getTrackInfo(user, artist, title)
    const userInfo = await getUserInfo(user)

    const playcountTrack = info?.userplaycount || 0
    const globalPlaycount = info?.playcount || 0
    const totalScrobbles = userInfo?.playcount || 0

    const caption = `
🎧 *${nowPlaying ? '𝐈𝐧 𝐫𝐢𝐩𝐫𝐨𝐝𝐮𝐳𝐢𝐨𝐧𝐞' : '𝐔𝐥𝐭𝐢𝐦𝐨 𝐛𝐫𝐚𝐧𝐨'}* 𝐝𝐢 @${m.sender.split('@')[0]}

🎵 *${title}*
🎤 ${artist}
💿 ${album}

▶️ 𝐀𝐬𝐜𝐨𝐥𝐭𝐢 𝐏𝐞𝐫𝐬𝐨𝐧𝐚𝐥𝐢: *${playcountTrack}*
🌍 𝐀𝐬𝐜𝐨𝐥𝐭𝐢 𝐆𝐥𝐨𝐛𝐚𝐥𝐢: *${globalPlaycount}*
📊 𝐀𝐬𝐜𝐨𝐥𝐭𝐢 𝐓𝐨𝐭𝐚𝐥𝐢: *${totalScrobbles}*
    `.trim()

    const msg = {
      image: image ? { url: image } : undefined,
      caption,
      mentions: conn.parseMention(caption),
      buttons: [
        { buttonId: `.play_audio`, buttonText: { displayText: '🎧 𝐒𝐂𝐀𝐑𝐈𝐂𝐀 𝐀𝐔𝐃𝐈𝐎' }, type: 1 },
        { buttonId: `.like ${artist} - ${title}`, buttonText: { displayText: '❤️ 𝐋𝐈𝐊𝐄' }, type: 1 }
      ],
      headerType: 4,
      footer: `𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭 𝐕𝟑`
    }

    await conn.sendMessage(m.chat, msg, { quoted: m })
    return
  }

  if (command === 'topartists') {
    const period = args[0] || '7day'
    const limit = parseInt(args[1]) || 9
    const artists = await getTopArtists(user, period, limit)
    if (!artists) return conn.sendMessage(m.chat, { text: '❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐚𝐫𝐭𝐢𝐬𝐭𝐚 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.' })

    const caption = `🎤 *𝐓𝐨𝐩 𝐀𝐫𝐭𝐢𝐬𝐭𝐢* (${period})\n\n` +
      artists.map((a, i) => `${i + 1}. ${a.name} - ${a.playcount} ascolti`).join('\n')

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    return
  }

  if (command === 'topalbums') {
    const period = args[0] || '7day'
    const limit = parseInt(args[1]) || 9
    const albums = await getTopAlbums(user, period, limit)
    if (!albums) return conn.sendMessage(m.chat, { text: '❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐚𝐥𝐛𝐮𝐦 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.' })

    const caption = `💿 *𝐓𝐨𝐩 𝐀𝐥𝐛𝐮𝐦* (${period})\n\n` +
      albums.map((a, i) => `${i + 1}. ${a.name} - ${a.artist.name} (${a.playcount} ascolti)`).join('\n')

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    return
  }

  if (command === 'toptracks') {
    const period = args[0] || '7day'
    const limit = parseInt(args[1]) || 9
    const tracks = await getTopTracks(user, period, limit)
    if (!tracks) return conn.sendMessage(m.chat, { text: '❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐭𝐫𝐚𝐜𝐜𝐢𝐚 𝐭𝐫𝐨𝐯𝐚𝐭𝐚.' })

    const caption = `🎵 *𝐓𝐨𝐩 𝐓𝐫𝐚𝐜𝐜𝐞* (${period})\n\n` +
      tracks.map((t, i) => `${i + 1}. ${t.name} - ${t.artist.name} (${t.playcount} ascolti)`).join('\n')

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    return
  }

  if (command === 'cronologia') {
    const limit = parseInt(args[0]) || 10
    const tracks = await getRecentTracks(user, limit)
    if (!tracks) return conn.sendMessage(m.chat, { text: '❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐜𝐫𝐨𝐧𝐨𝐥𝐨𝐠𝐢𝐚 𝐭𝐫𝐨𝐯𝐚𝐭𝐚.' })

    const caption = `📜 *𝐂𝐫𝐨𝐧𝐨𝐥𝐨𝐠𝐢𝐚*\n\n` +
      tracks.map((t, i) => `${i + 1}. ${t.name} - ${t.artist['#text']} (${new Date(t.date?.uts * 1000).toLocaleString()})`).join('\n')

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    return
  }

}

handler.command = ['setuser', 'cur', 'topartists', 'topalbums', 'toptracks', 'cronologia']
handler.group = true

export default handler
