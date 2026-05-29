//Codice di config.js

//Codice di config.js

import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import chalk from 'chalk'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import NodeCache from 'node-cache'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const moduleCache = new NodeCache({ stdTTL: 300 });

	
global.dieh = ['393892016995',]
global.owner = [
  ['393892016995', 'Capo zozzap', true],
  ['xxxxxxxxxxxxx'],
  ['xxxxxxxxxxxxx'],
  ['xxxxxxxxxxxxx'],
]


global.nomepack = '𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭'
global.nomebot = '𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭'
global.wm = '𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭'
global.autore = 'dieh'
global.dev = '.'
global.testobot = `𝐒𝐛𝐨𝐫𝐫𝐚 𝐁𝐨𝐭`
global.versione = pkg.version
global.errore = '⚠️ *Errore inatteso!* Usa il comando `.ticket` per avvisare gli owner.'


global.repobot = 'https://github.com/watted90/sborra-bot'
global.canale = 'https://whatsapp.com/channel/0029Vb6OBLP5fM5YMjXBFU3Z'
global.gruppo = 'https://chat.whatsapp.com/FnSdI9q8OsJ2r0kDmPGO7q' 


global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment


global.APIKeys = { 
    spotifyclientid: '333',
    spotifysecret: '333',
    browserless: '333',
    screenshotone: '333',
    screenshotone_default: '333',
    tmdb: '333',
    gemini:'333',
    ocrspace: '333',
    assemblyai: '333',
    google: '333',
    googlex: '333',
    googleCX: '333',
    genius: '333',
    unsplash: '333',
    removebg: 'FEx4CYmYN1QRQWD1mbZp87jV',
    openrouter: '333',
    lastfm: '36f859a1fc4121e7f0e931806507d5f9',
}


let filePath = fileURLToPath(import.meta.url)
let fileUrl = pathToFileURL(filePath).href
const reloadConfig = async () => {
  const cached = moduleCache.get(fileUrl);
  if (cached) return cached;
  unwatchFile(filePath)
  console.log(chalk.bgHex('#ff0000')(chalk.white.bold("File: 'config.js' Aggiornato")))
  const module = await import(`${fileUrl}?update=${Date.now()}`)
  moduleCache.set(fileUrl, module, { ttl: 300 });
  return module;
}
watchFile(filePath, reloadConfig)