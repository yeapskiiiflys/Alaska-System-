const { EmbedBuilder } = require('discord.js');

const rulesEmbed = new EmbedBuilder()
  .setTitle('✈️  Alaska Airlines Virtual — Community Rules')
  .setThumbnail('https://cdn.discordapp.com/icons/1491959579385528500/651911fada590176e04cbb33eed4a6ea.webp?size=1024')
  .setDescription(`Safety, professionalism, and respect are our top priorities at Alaska Airlines Virtual.
As a member of this server, you are expected to follow all rules below. Failure to comply may result in warnings, suspension, or a permanent ban.
ㅤ
⚖️ **Respect & Professional Conduct**
All members must treat others with respect at all times. Harassment, discrimination, or toxic behavior of any kind is strictly prohibited.
ㅤ
🚫 **Discrimination & Harassment**
Any form of hate speech, discrimination, or harassment based on race, gender, religion, nationality, or any other factor will result in immediate disciplinary action, including bans.
ㅤ
💬 **Language & Behavior**
Keep communication respectful and professional.
• No bullying, insulting, trolling, or aggressive behavior
• Swearing should be kept minimal and not directed at others
• Follow moderator guidance at all times
ㅤ
📢 **Spam & Advertising**
Spamming in any form is not allowed, including:
• Repeated messages or excessive emojis
• Command spam or ping spam
• Unauthorized advertising or self-promotion
• DM advertising to members
ㅤ
🔒 **Privacy & Information Security**
Sharing private or internal information is strictly forbidden.
• No leaking server content, documents, or conversations
• Do not share personal information (yours or others')
• Respect the privacy of all members
ㅤ
⚠️ **Threats & Intimidation**
Threatening, blackmailing, or intimidating any member is strictly prohibited.
This includes jokes about harm, raids, or malicious activity.
ㅤ
🖼️ **Content Guidelines**
Keep all content appropriate for a general audience.
• Graphic or disturbing content is not allowed
• No controversial or sensitive topics that may disrupt the community
ㅤ
📜 **Compliance**
All members must follow:
• Discord Terms of Service
• Project Flight rules
• Alaska Airlines Virtual procedures
Any action that disrupts the server, harms the airline's image, or negatively affects others is not permitted and will be subject to moderation.
ㅤ
✈️ *"Professionalism Above All — Represent Alaska Airlines with Excellence."*`)
  .setColor('#003876')
  .setFooter({ text: 'Alaska Airlines Virtual  •  Last updated' })
  .setTimestamp();

module.exports = { rulesEmbed };
