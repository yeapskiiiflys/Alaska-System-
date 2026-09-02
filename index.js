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
  return member.roles.cache.some(role =>
    ALLOWED_ROLE_NAMES.includes(role.name.toLowerCase())
  );
}

const WELCOME_TITLE = "✈️ Welcome to Alaska Airlines Virtual!";

function buildWelcomeEmbed(userId) {
  return new EmbedBuilder()
    .setTitle(WELCOME_TITLE)
    .setDescription(
      "Welcome aboard <@" + userId + ">!\n\nPlease complete onboarding and enjoy your flights."
    )
    .setColor(0x0057B8)
    .setThumbnail("https://i.postimg.cc/L6GmP9HR/asaksa-new.png")
    .setFooter({
      text: "Fly Smart. Land Safe.",
      iconURL: "https://i.postimg.cc/L6GmP9HR/asaksa-new.png",
    });
}

client.once(Events.ClientReady, () => {
  console.log("Logged in as " + client.user.tag);

  // ❌ REMOVED AUTO-LEAVE SYSTEM (this was blocking your bot)
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const channel = member.guild.channels.cache.get("1491998338630025348");
    if (!channel) return;

    await new Promise(r => setTimeout(r, 5000));

    await channel.send({
      embeds: [buildWelcomeEmbed(member.id)],
    });
  } catch (err) {
    console.error(err);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (handledInteractions.has(interaction.id)) return;
  markHandled(interaction.id);

  // ── /postcontract ─────────────────────────────
  if (interaction.isChatInputCommand() && interaction.commandName === "postcontract") {
    try {
      await safeDefer(interaction);

      const type = interaction.options.getString("type");
      const route = interaction.options.getString("route");
      const aircraft = interaction.options.getString("aircraft");
      const description = interaction.options.getString("description");
      const reward = interaction.options.getInteger("reward");
      const role = interaction.options.getRole("pingrole");
      const id = Date.now().toString();

      const embed = new EmbedBuilder()
        .setTitle("NEW FLIGHT CONTRACT")
        .setColor(0x0057B8)
        .addFields(
          { name: "Type", value: type, inline: true },
          { name: "Route", value: route, inline: true },
          { name: "Aircraft", value: aircraft, inline: true },
          { name: "Reward", value: String(reward), inline: true },
          { name: "Description", value: description, inline: false }
        );

      const button = new ButtonBuilder()
        .setCustomId("claim_" + id)
        .setLabel("CLAIM CONTRACT")
        .setStyle(ButtonStyle.Success);

      await interaction.editReply({
        content: role ? `<@&${role.id}>` : null,
        allowedMentions: role ? { roles: [role.id] } : { parse: [] },
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(button)],
      });

    } catch (err) {
      console.error(err);
    }
  }

  // ── CLAIM CONTRACT ───────────────────────────
  if (interaction.isButton() && interaction.customId.startsWith("claim_")) {
    try {
      await safeDeferUpdate(interaction);

      const original = interaction.message.embeds[0];

      const updated = EmbedBuilder.from(original)
        .setColor(0x2ECC71);

      const button = new ButtonBuilder()
        .setCustomId("claimed")
        .setLabel("CLAIMED")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      await interaction.editReply({
        embeds: [updated],
        components: [new ActionRowBuilder().addComponents(button)],
      });

    } catch (err) {
      console.error(err);
    }
  }
});

client.login(process.env.TOKEN);
