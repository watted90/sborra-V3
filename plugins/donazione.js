//Plugin by Gab, Lucifero & 333 staff

let handler = async (m, { conn }) => {

  const text =
`immagina spendere soldi per gli schiavetti dello zap`;

  await conn.sendMessage(m.chat, { text });
};

handler.command = /^donazione$/i;

export default handler;