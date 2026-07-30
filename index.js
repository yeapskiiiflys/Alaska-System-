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

const ALLOWED_GUILD   = "1491959579385528500";
const LOGBOOK_CHANNEL = "1492025670384095282";

// Roles allowed to log flights (Trainee Pilot or higher)
// Add role IDs here — anyone with ANY of these roles can log
const ALLOWED_ROLE_NAMES = [
  "trainee pilot",
  "cadet pilot",
  "first officer",
  "captain",
  "senior captain",
  "chief pilot",
  "management",
  "staff",
  "admin",
  "moderator",
];

// In-memory flight log store (resets on bot restart)
// For persistent storage you would need a database
const flightLogs = {};

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

function hasAllowedRole(member) {
  return member.roles.cache.some(function(role) {
    return ALLOWED_ROLE_NAMES.includes(role.name.toLowerCase());
  });
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

  client.guilds.cache.forEach(function(guild) {
    if (guild.id !== ALLOWED_GUILD) {
      console.log("Leaving unauthorized server: " + guild.name);
      guild.leave();
    }
  });
});

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
    if (!channel) { console.warn("Welcome channel not found"); return; }

    await new Promise(function(resolve) { setTimeout(resolve, 5000); });

    const recent = await channel.messages.fetch({ limit: 10 });
    const alreadySent = recent.some(function(msg) {
      if (!msg.author.bot) return false;
      if (!msg.embeds.length) return false;
      const age = Date.now() - msg.createdTimestamp;
      return age < 30000 && msg.embeds[0].description && msg.embeds[0].description.includes("<@" + member.id + ">");
    });

    if (alreadySent) { console.log("Welcome already sent - skipping"); return; }

    await channel.send({ embeds: [buildWelcomeEmbed(member.id)] });
    console.log("Welcome sent for " + member.user.tag);
  } catch (err) {
    console.error("Error sending welcome message:", err);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (handledInteractions.has(interaction.id)) return;
  markHandled(interaction.id);

  // ── /logflight ────────────────────────────────────────────────────────────
  if (interaction.isChatInputCommand() && interaction.commandName === "logflight") {
    try { await safeDefer(interaction); } catch (err) { return; }

    try {
      // Check role
      if (!hasAllowedRole(interaction.member)) {
        await interaction.editReply({ content: "You need to be a Trainee Pilot or higher to log flights.", ephemeral: true });
        return;
      }

      const callsign    = interaction.options.getString("callsign")    || "N/A";
      const aircraft    = interaction.options.getString("aircraft")    || "N/A";
      const departure   = interaction.options.getString("departure")   || "N/A";
      const arrival     = interaction.options.getString("arrival")     || "N/A";
      const route       = interaction.options.getString("route")       || "N/A";
      const screenshot  = interaction.options.getString("screenshot")  || null;
      const remarks     = interaction.options.getString("remarks")     || "None";
      const contract_id = interaction.options.getString("contract_id") || "N/A";
      const userId      = interaction.user.id;
      const logId       = Date.now().toString();
      const timestamp   = new Date().toUTCString();

      // Save to memory
      if (!flightLogs[userId]) flightLogs[userId] = { tag: interaction.user.tag, flights: 0 };
      flightLogs[userId].flights += 1;
      flightLogs[userId].tag = interaction.user.tag;

      // Build log embed
      const logEmbed = new EmbedBuilder()
        .setTitle("Flight Log Entry")
        .setColor(0x0057B8)
        .setThumbnail("https://i.postimg.cc/L6GmP9HR/asaksa-new.png")
        .addFields(
          { name: "Pilot",       value: "<@" + userId + ">",          inline: true },
          { name: "Callsign",    value: callsign,                      inline: true },
          { name: "Aircraft",    value: aircraft,                      inline: true },
          { name: "Departure",   value: departure,                     inline: true },
          { name: "Arrival",     value: arrival,                       inline: true },
          { name: "Route",       value: route,                         inline: false },
          { name: "Contract ID", value: contract_id,                   inline: true },
          { name: "Remarks",     value: remarks,                       inline: false },
          { name: "Total Flights", value: String(flightLogs[userId].flights), inline: true },
          { name: "Log ID",      value: logId,                         inline: true }
        )
        .setFooter({ text: "Alaska Systems+  |  " + timestamp, iconURL: "https://i.postimg.cc/L6GmP9HR/asaksa-new.png" });

      if (screenshot) logEmbed.setImage(screenshot);

      // Post to logbook channel
      const logChannel = interaction.guild.channels.cache.get(LOGBOOK_CHANNEL);
      if (logChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      }

      await interaction.editReply({ content: "Flight logged successfully! Check <#" + LOGBOOK_CHANNEL + ">.", ephemeral: true });
      console.log("FLIGHT LOGGED: " + interaction.user.tag + " - " + departure + " to " + arrival);
    } catch (err) {
      console.error("Error logging flight:", err);
      await safeError(interaction, "Failed to log flight. Please try again.");
    }

    return;
  }

  // ── /leaderboard ──────────────────────────────────────────────────────────
  if (interaction.isChatInputCommand() && interaction.commandName === "leaderboard") {
    try { await safeDefer(interaction); } catch (err) { return; }

    try {
      const sorted = Object.entries(flightLogs)
        .sort(function(a, b) { return b[1].flights - a[1].flights; })
        .slice(0, 10);

      if (sorted.length === 0) {
        await interaction.editReply({ content: "No flights have been logged yet!" });
        return;
      }

      const medals = ["🥇", "🥈", "🥉"];
      var board = "";
      sorted.forEach(function(entry, i) {
        var userId = entry[0];
        var data   = entry[1];
        var medal  = medals[i] || (i + 1) + ".";
        board += medal + " <@" + userId + "> — **" + data.flights + "** flight" + (data.flights === 1 ? "" : "s") + "\n";
      });

      const embed = new EmbedBuilder()
        .setTitle("Alaska Airlines Virtual — Pilot Leaderboard")
        .setDescription(board)
        .setColor(0x0057B8)
        .setThumbnail("https://i.postimg.cc/L6GmP9HR/asaksa-new.png")
        .setFooter({ text: "Alaska Systems+  |  Ranked by total flights logged", iconURL: "https://i.postimg.cc/L6GmP9HR/asaksa-new.png" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
      console.log("LEADERBOARD SHOWN");
    } catch (err) {
      console.error("Error showing leaderboard:", err);
      await safeError(interaction, "Failed to show leaderboard.");
    }

    return;
  }

  // ── /postcontract ─────────────────────────────────────────────────────────
  if (interaction.isChatInputCommand() && interaction.commandName === "postcontract") {
    try { await safeDefer(interaction); } catch (err) { return; }

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
        .setFooter({ text: "Alaska Systems+", iconURL: "https://i.postimg.cc/L6GmP9HR/asaksa-new.png" })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId("claim_" + id)
        .setLabel("CLAIM CONTRACT")
        .setStyle(ButtonStyle.Success);

      await interaction.editReply({
        content: role ? "<@&" + role.id + ">" : undefined,
        allowedMentions: role ? { roles: [role.id] } : { parse: [] },
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(button)],
      });

      console.log("CONTRACT POSTED: " + id);
    } catch (err) {
      console.error("Error posting contract:", err);
      await safeError(interaction, "Failed to post contract.");
    }

    return;
  }

  // ── Claim button ──────────────────────────────────────────────────────────
  if (interaction.isButton() && interaction.customId.startsWith("claim_")) {
    try { await safeDeferUpdate(interaction); } catch (err) { return; }

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
      await safeError(interaction, "Failed to claim contract.");
    }

    return;
  }
});

process.on("SIGTERM", function() { client.destroy(); process.exit(0); });
process.on("SIGINT",  function() { client.destroy(); process.exit(0); });

client.login(process.env.TOKEN);
