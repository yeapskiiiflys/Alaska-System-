const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
} = require("discord.js");
require("dotenv").config();

console.log("ALASKA SYSTEMS CONTRACT BOT ONLINE");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

const handledInteractions = new Set();
function markHandled(id) {
  handledInteractions.add(id);
  setTimeout(() => handledInteractions.delete(id), 10_000);
}

async function safeDefer(interaction) {
  if (interaction.deferred || interaction.replied) return;
  await interaction.deferReply();
}
async function safeDeferUpdate(interaction) {
  if (interaction.deferred || interaction.replied) return;
  await interaction.deferUpdate();
}
async function safeError(interaction, message) {
  message = message || "An error occurred.";
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: message, embeds: [], components: [] });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  } catch (e) {}
}

function buildWelcomeEmbed(userId) {
  return new EmbedBuilder()
    .setTitle("✈️ 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 𝐀𝐥𝐚𝐬𝐤𝐚 𝐀𝐢𝐫𝐥𝐢𝐧𝐞𝐬 𝐕𝐢𝐫𝐭𝐮𝐚𝐥!")
    .setDescription(
      "Welcome aboard <@" + userId + ">! We are thrilled to have you join our flight operations. Whether you are a seasoned captain or a new cadet, you've found your home in the skies.\n\nPlease review the pre-flight briefing below to get started.\n\n\n📋 **__𝗣𝗥𝗘-𝗙𝗟𝗜𝗚𝗛𝗧 𝗖𝗛𝗘𝗖𝗞𝗟𝗜𝗦𝗧__**\n\n1. 𝐎𝐏𝐄𝐑𝐀𝐓𝐈𝐍𝐆 𝐏𝐑𝐎𝐂𝐄𝐃𝐔𝐑𝐄𝐒\nHead over to <#1491998338630025348> for more information.\n\n2. 𝐑𝐀𝐃𝐈𝐎 𝐂𝐇𝐄𝐂𝐊\nIntroduce yourself in our <#1491959580173930689> and let us know you've arrived!\n\n\n🌐 **__𝗢𝗨𝗥 𝗣𝗨𝗥𝗣𝗢𝗦𝗘__**\nTo provide the most realistic and professional virtual airline experience, honoring the legacy of the Great North."
    )
    .setColor(15822)
    .setThumbnail("https://i.postimg.cc/L6GmP9HR/asaksa-new.png")
    .setFooter({
      text: "Fly Smart. Land Safe. | Alaska Airlines Virtual",
      iconURL: "https://i.postimg.cc/L6GmP9HR/asaksa-new.png",
    });
}

client.once(Events.ClientReady, () => {
  console.log("Logged in as " + client.user.tag);
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    console.log("Member joined: " + member.user.tag);
    const channel = member.guild.channels.cache.get("1491998338630025348");
    if (!channel) {
      console.warn("Welcome channel not found");
      return;
    }

    // Check if a welcome was already sent for this user in the last 30 seconds
    const recent = await channel.messages.fetch({ limit: 10 });
    const alreadySent = recent.some(function(msg) {
      if (!msg.author.bot) return false;
      if (!msg.embeds.length) return false;
      const embed = msg.embeds[0];
      const age = Date.now() - msg.createdTimestamp;
      return age < 30000 && embed.description && embed.description.includes("<@" + member.id + ">");
    });

    if (alreadySent) {
      console.log("Welcome already sent for " + member.user.tag + " — skipping duplicate");
      return;
    }

    // Wait 5 seconds so any old Railway instance has time to shut down
    await new Promise(function(resolve) { setTimeout(resolve, 5000); });

    // Check again after the delay in case the old instance already sent it
    const recheck = await channel.messages.fetch({ limit: 10 });
    const alreadySentNow = recheck.some(function(msg) {
      if (!msg.author.bot) return false;
      if (!msg.embeds.length) return false;
      const embed = msg.embeds[0];
      const age = Date.now() - msg.createdTimestamp;
      return age < 30000 && embed.description && embed.description.includes("<@" + member.id + ">");
    });

    if (alreadySentNow) {
      console.log("Welcome already sent after delay for " + member.user.tag + " — skipping");
      return;
    }

    await channel.send({ embeds: [buildWelcomeEmbed(member.id)] });
    console.log("Welcome sent for " + member.user.tag);
  } catch (err) {
    console.error("Error sending welcome message:", err);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (handledInteractions.has(interaction.id)) return;
  markHandled(interaction.id);

  if (interaction.isChatInputCommand() && interaction.commandName === "postcontract") {
    try {
      await safeDefer(interaction);
    } catch (err) {
      console.error("Failed to defer:", err);
      return;
    }

    try {
      const type        = interaction.options.getString("type")        || "N/A";
      const route       = interaction.options.getString("route")       || "N/A";
      const aircraft    = interaction.options.getString("aircraft")    || "N/A";
      const description = interaction.options.getString("description") || "N/A";
      const reward      = interaction.options.getInteger("reward")     || 0;
      const role        = interaction.options.getRole("pingrole");
      const id          = Date.now().toString();

      const formattedReward = "$" + reward.toLocaleString("en-US");

      const embed = new EmbedBuilder()
        .setTitle("NEW FLIGHT CONTRACT")
        .setColor(0x0057B8)
        .setThumbnail("https://cdn.discordapp.com/icons/1491959579385528500/651911fada590176e04cbb33eed4a6ea.webp?size=1024")
        .addFields(
          { name: "Type",     value: type,            inline: true },
          { name: "Route",    value: route,           inline: true },
          { name: "Aircraft", value: aircraft,        inline: true },
          { name: "Reward",   value: formattedReward, inline: true }
        )
        .addFields(
          { name: "\u200B",      value: "\u200B",    inline: false },
          { name: "Description", value: description, inline: false },
          { name: "\u200B",      value: "\u200B",    inline: false },
          { name: "Status",      value: "Unclaimed", inline: true  },
          { name: "Claimed by",  value: "No one yet",inline: true  },
          { name: "Dispatch Release Number", value: id, inline: false }
        )
        .setFooter({
          text: "Alaska Systems+",
          iconURL: "https://i.postimg.cc/L6GmP9HR/asaksa-new.png",
        })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId("claim_" + id)
        .setLabel("CLAIM CONTRACT")
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.editReply({
        content: role ? "<@&" + role.id + ">" : undefined,
        allowedMentions: role ? { roles: [role.id] } : { parse: [] },
        embeds: [embed],
        components: [row],
      });

      console.log("CONTRACT POSTED: " + id);
    } catch (err) {
      console.error("Error posting contract:", err);
      await safeError(interaction, "Failed to post contract. Please try again.");
    }

    return;
  }

  if (interaction.isButton() && interaction.customId.startsWith("claim_")) {
    try {
      await safeDeferUpdate(interaction);
    } catch (err) {
      console.error("Failed to defer button:", err);
      return;
    }

    try {
      const id        = interaction.customId.split("_")[1];
      const claimedBy = "<@" + interaction.user.id + 
