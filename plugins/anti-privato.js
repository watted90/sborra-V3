//Codice di anti-privato.js

export async function before(m, { isOwner, isRowner }) {
    if (m.fromMe) return true;
    if (m.isGroup) return false;
    if (!m.message) return true;
    if (isOwner || isRowner) return false;
    const botSettings = global.db.data.settings[this.user.jid] || {};
    if (botSettings.antiprivato) {
      if (typeof m.text === 'string') m.text = '';
      return true;
    }
    return false;
}