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

const ALLOWED_GUILD = "1491959579385528500";

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

var WELCOME_TITLE  = "\u2708\uFE0F \uD835\uDC16\uD835\uDC1E\uD835\uDC25\uD835\uDC1C\uD835\uDC28\uD835\uDC26\uD835\uDC1E \uD835\uDC2D\uD835\uDC28 \uD835\uDC00\uD835\uDC25\uD835\uDC1A\uD835\uDC2C\uD835\uDC24\uD835\uDC1A \uD835\uDC00\uD835\uDC22\uD835\uDC2B\uD835\uDC25\uD835\uDC22\uD835\uDC27\uD835\uDC1E\uD835\uDC2C \uD835\uDC15\uD835\uDC22\uD835\uDC2B\uD835\uDC2D\uD835\uDC2E\uD835\uDC1A\uD835\uDC25!";
var CHECKLIST_HEAD = "\uD83D\uDCCB **__\uD835\uDDE3\uD835\uDDE5\uD835\uDDD8-\uD835\uDDD9\uD835\uDDDF\uD835\uDDDC\uD835\uDDDA\uD835\uDDDB\uD835\uDDE7 \uD835\uDDD6\uD835\uDDDB\uD835\uDDD8\uD835\uDDD6\uD835\uDDDE\uD835\uDDDF\uD835\uDDDC\uD835\uDDE6\uD835\uDDE7__**";
var OP_PROCEDURES  = "\uD835\uDC0E\uD835\uDC0F\uD835\uDC04\uD835\uDC11\uD835\uDC00\uD835\uDC13\uD835\uDC08\uD835\uDC0D\uD835\uDC06 \uD835\uDC0F\uD835\uDC11\uD835\uDC0E\uD835\uDC02\uD835\uDC04\uD835\uDC03\uD835\uDC14\uD835\uDC11\uD835\uDC04\uD835\uDC12";
var RADIO_CHECK    = "\uD835\uDC11\uD835\uDC00\uD835\uDC03\uD835\uDC08\uD835\uDC0E \uD835\uDC02\uD835\uDC07\uD835\uDC04\uD835\uDC02\uD835\uDC0A";
var OUR_PURPOSE    = "\uD83C\uDF10 **__\uD835\uDDE2\uD835\uDDE8\uD835\uDDE5 \uD835\uDDE3\uD835\uDDE8\uD835\uDDE5\uD835\uDDE3\uD835\uDDE2\uD835\uDDE6\uD835\uDDD8__**";

function buildWelcomeEmbed(userId) {
  var desc =
    "Welcome aboard <@" + userId + ">! We are thrilled to have you join our flight operations. Whether you are a seasoned captain or a new cadet, you've found your home in the skies." +
    "\n\nPlease review the pre-flight briefing below to get started." +
    "\n\n\n" + CHECKLIST_HEAD +
    "\n\n1. " + OP_PROCEDURES + "\nHead over to <#1491998338630025348> for more information." +
    "\n\n2. " + RADIO_CHECK + "\nIntroduce yourself in our <#1491959580173930689> and let us know you've arrived!" +
    "\n\n\n" + OUR_PURPOSE + "\nTo provide the most realistic and professional virtual airline experience, honoring the legacy of the Great North.";

  return new EmbedBuilder()
    .setTitle(WELCOME_TITLE)
    .setDescription(desc)
    .setColor(15822)
    .setThumbnail("https://i.postimg.cc/L6GmP9HR/asaksa-new.png")
    .setFooter({
      text: "Fly Smart. Land Safe. | Alaska Airlines Virtual",
      iconURL: "https://i.postimg.cc/L6GmP9HR/asaksa-new.png",
    });
}

client.once(Events.ClientReady, () => {
  console.log("Logged in as " + client.user.tag);

  // Leave any server that is not the Alaska Airlines Virtual server
  client.guilds.cache.forEach(function(guild) {
    if (guild.id !== ALLOWED_GUILD) {
      console.log("Leaving unauthorized server: " + guild.name);
      guild.leave();
    }
  });
});

// Auto-leave any server the bot gets added to in the future
client.on(Events.GuildCreate, function(guild) {
  if (guild.id !== ALLOWED_GUILD) {
    console.log("Joined unauthorized server, leaving: " + guild.name);
    guild.leave();
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    console.log("Member joined: " + member.user.tag);
    const channel = member.guild.channels.cache.get("1491998338630025348");
    if (!channel) {
      console.warn("Welcome channel not found");
      return;
    }

    // Wait 5 seconds so old Railway instance has time to shut down
    await new Promise(function(resolve) { setTimeout(resolve, 5000); });

    // Check last 10 messages - if welcome already sent in last 30s, skip
    const recent = await channel.messages.fetch({ limit: 10 });
    const alreadySent = recent.some(function(msg) {
      if (!msg.author.bot) return false;
      if (!msg.embeds.length) return false;
      const age = Date.now() - msg.createdTimestamp;
      return age < 30000 && msg.embeds[0].description && msg.embeds[0].description.includes("<@" + member.id + ">");
    });

    if (alreadySent) {
      console.log("Welcome already sent for " + member.user.tag + " - skipping duplicate");
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
      const claimedBy = "<@" + interaction.user.id + ">";
      const originalEmbed = interaction.message.embeds[0];

      const updatedEmbed = EmbedBuilder.from(originalEmbed)
        .setColor(0x2ECC71)
        .spliceFields(
          originalEmbed.fields.length - 2,
          2,
          { name: "Status",     value: "Claimed", inline: true },
          { name: "Claimed by", value: claimedBy, inline: true }
        )
        .setTimestamp();

      const disabledButton = new ButtonBuilder()
        .setCustomId("claimed_disabled")
        .setLabel("CLAIMED")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      await interaction.editReply({
        embeds: [updatedEmbed],
        components: [new ActionRowBuilder().addComponents(disabledButton)],
      });

      console.log("CONTRACT CLAIMED: " + id + " by " + interaction.user.tag);
    } catch (err) {
      console.error("Error claiming contract:", err);
      await safeError(interaction, "Failed to claim contract. Please try again.");
    }

    return;
  }
});

process.on("SIGTERM", function() { client.destroy(); process.exit(0); });
process.on("SIGINT",  function() { client.destroy(); process.exit(0); });

client.login(process.env.TOKEN);
