const { EmbedBuilder } = require('discord.js');

const rulesEmbed = new EmbedBuilder()
  .setTitle('✈️ 𝐀𝐥𝐚𝐬𝐤𝐚 𝐀𝐢𝐫𝐥𝐢𝐧𝐞𝐬 𝐕𝐢𝐫𝐭𝐮𝐚𝐥 — 𝐂𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲 𝐑𝐮𝐥𝐞𝐬')
  .setThumbnail('https://i.postimg.cc/L6GmP9HR/asaksa-new.png')
  .setDescription(`Safety, professionalism, and respect are our top priorities at Alaska Airlines Virtual.
As a member of this server, you are expected to follow all rules below. Failure to comply may result in warnings, suspension, or a permanent ban.
ㅤ
⚖️ **__𝐑𝐄𝐒𝐏𝐄𝐂𝐓 & 𝐏𝐑𝐎𝐅𝐄𝐒𝐒𝐈𝐎𝐍𝐀𝐋 𝐂𝐎𝐍𝐃𝐔𝐂𝐓__**
All members must treat others with respect at all times. Harassment, discrimination, or toxic behavior of any kind is strictly prohibited.
ㅤ
🚫 **__𝐃𝐈𝐒𝐂𝐑𝐈𝐌𝐈𝐍𝐀𝐓𝐈𝐎𝐍 & 𝐇𝐀𝐑𝐀𝐒𝐒𝐌𝐄𝐍𝐓__**
Any form of hate speech, discrimination, or harassment based on race, gender, religion, nationality, or any other factor will result in immediate disciplinary action, including bans.
ㅤ
💬 **__𝐋𝐀𝐍𝐆𝐔𝐀𝐆𝐄 & 𝐁𝐄𝐇𝐀𝐕𝐈𝐎𝐑__**
Keep communication respectful and professional.
• No bullying, insulting, trolling, or aggressive behavior
• Swearing should be kept minimal and not directed at others
• Follow moderator guidance at all times
ㅤ
📢 **__𝐒𝐏𝐀𝐌 & 𝐀𝐃𝐕𝐄𝐑𝐓𝐈𝐒𝐈𝐍𝐆__**
Spamming in any form is not allowed, including:
• Repeated messages or excessive emojis
• Command spam or ping spam
• Unauthorized advertising or self-promotion
• DM advertising to members
ㅤ
🔒 **__𝐏𝐑𝐈𝐕𝐀𝐂𝐘 & 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘__**
Sharing private or internal information is strictly forbidden.
• No leaking server content, documents, or conversations
• Do not share personal information (yours or others')
• Respect the privacy of all members
ㅤ
⚠️ **__𝐓𝐇𝐑𝐄𝐀𝐓𝐒 & 𝐈𝐍𝐓𝐈𝐌𝐈𝐃𝐀𝐓𝐈𝐎𝐍__**
Threatening, blackmailing, or intimidating any member is strictly prohibited.
This includes jokes about harm, raids, or malicious activity.
ㅤ
🖼️ **__𝐂𝐎𝐍𝐓𝐄𝐍𝐓 𝐆𝐔𝐈𝐃𝐄𝐋𝐈𝐍𝐄𝐒__**
Keep all content appropriate for a general audience.
• Graphic or disturbing content is not allowed
• No controversial or sensitive topics that may disrupt the community
ㅤ
📜 **__𝐂𝐎𝐌𝐏𝐋𝐈𝐀𝐍𝐂𝐄__**
All members must follow:
• Discord Terms of Service
• Project Flight rules
• Alaska Airlines Virtual procedures
Any action that disrupts the server, harms the airline's image, or negatively affects others is not permitted and will be subject to moderation.
ㅤ
✈️ *"Professionalism Above All — Represent Alaska Airlines with Excellence."*`)
  .setColor('#003876')
  .setFooter({
    text: 'Fly Smart. Land Safe. | Alaska Airlines Virtual',
    iconURL: 'https://i.postimg.cc/L6GmP9HR/asaksa-new.png',
  })
  .setTimestamp();

module.exports = { rulesEmbed };
