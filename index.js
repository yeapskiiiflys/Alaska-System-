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

console.log("🔥 ALASKA SYSTEMS CONTRACT BOT ONLINE");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ─── Duplicate-interaction guard ─────────────────────────────────────────────
const handledInteractions = new Set();
function markHandled(id) {
  handledInteractions.add(id);
  setTimeout(() => handledInteractions.delete(id), 10_000);
}

// ─── Safe helpers ─────────────────────────────────────────────────────────────
async function safeDefer(interaction) {
  if (interaction.deferred || interaction.replied) return;
  await interaction.deferReply();
}
async function safeDeferUpdate(interaction) {
  if (interaction.deferred || interaction.replied) return;
  await interaction.deferUpdate();
}
async function safeError(interaction, message = "An error occurred.") {
  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: message, embeds: [], components: [] });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  } catch {}
}

// ─── READY ────────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ─── INTERACTION HANDLER ──────────────────────────────────────────────────────
client.on(Events.InteractionCreate, async (interaction) => {
  if (handledInteractions.has(interaction.id)) return;
  markHandled(interaction.id);

  // ── /postcontract ─────────────────────────────────────────────────────────
  if (interaction.isChatInputCommand() && interaction.commandName === "postcontract") {
    try {
      await safeDefer(interaction);
    } catch (err) {
      console.error("❌ Failed to defer:", err);
      return;
    }

    try {
      const type        = interaction.options.getString("type")        || "N/A";
      const route       = interaction.options.getString("route")       || "N/A";
      const aircraft    = interaction.options.getString("aircraft")    || "N/A";
      const description = interaction.options.getString("description") || "N/A";
      const reward      = interaction.options.getInteger("reward")     ?? 0;
      const role        = interaction.options.getRole("pingrole");
      const id          = Date.now().toString();

      const formattedRoute  = route.replace(/->|→|–/g, " ➜ ");
      const formattedReward = `$${reward.toLocaleString("en-US")}`;

      const embed = new EmbedBuilder()
        .setTitle("✈️  NEW FLIGHT CONTRACT")
        .setColor(0x0057B8)
        .setThumbnail("https://cdn.discordapp.com/icons/1491959579385528500/651911fada590176e04cbb33eed4a6ea.webp?size=1024")
        .addFields(
          { name: "🎫  Type",      value: type,            inline: true },
          { name: "🗺️  Route",    value: formattedRoute,  inline: true },
          { name: "✈️  Aircraft",  value: aircraft,        inline: true },
          { name: "💰  Reward",    value: formattedReward, inline: true },
        )
        .addFields(
          { name: "\u200B", value: "\u200B", inline: false },
          { name: "📋  Description", value: description,   inline: false },
          { name: "\u200B", value: "\u200B", inline: false },
          { name: "🔖  Status",      value: "Unclaimed",    inline: true },
          { name: "🏷️  Claimed by", value: "*No one yet*", inline: true },
        )
        .setFooter({ text: `Contract ID: ${id}  •  Alaska Systems` })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setCustomId(`claim_${id}`)
        .setLabel("✋  CLAIM CONTRACT")
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.editReply({
        content: role ? `<@&${role.id}>` : undefined,
        allowedMentions: role ? { roles: [role.id] } : { parse: [] },
        embeds: [embed],
        components: [row],
      });

      console.log(`✅ CONTRACT POSTED: ${id}`);
    } catch (err) {
      console.error("❌ Error posting contract:", err);
      await safeError(interaction, "Failed to post contract. Please try again.");
    }

    return;
  }

  // ── /postrules ────────────────────────────────────────────────────────────
  if (interaction.isChatInputCommand() && interaction.commandName === "postrules") {
    try {
      await safeDefer(interaction);
    } catch (err) {
      console.error("❌ Failed to defer /postrules:", err);
      return;
    }

    try {
      const { rulesEmbed } = require("./rulesEmbed");

      await interaction.editReply({
        embeds: [rulesEmbed],
      });

      console.log("✅ RULES POSTED");
    } catch (err) {
      console.error("❌ Error posting rules:", err);
      await safeError(interaction, "Failed to post rules. Please try again.");
    }

    return;
  }

  // ── Claim button ──────────────────────────────────────────────────────────
  if (interaction.isButton() && interaction.customId.startsWith("claim_")) {
    try {
      await safeDeferUpdate(interaction);
    } catch (err) {
      console.error("❌ Failed to defer button:", err);
      return;
    }

    try {
      const id        = interaction.customId.split("_")[1];
      const claimedBy = `<@${interaction.user.id}>`;

      const originalEmbed = interaction.message.embeds[0];

      const updatedEmbed = EmbedBuilder.from(originalEmbed)
        .setColor(0x2ECC71)
        .spliceFields(
          originalEmbed.fields.length - 2,
          2,
          { name: "🔖  Status",      value: "✅  Claimed", inline: true },
          { name: "🏷️  Claimed by", value: claimedBy,     inline: true },
        )
        .setTimestamp();

      const disabledButton = new ButtonBuilder()
        .setCustomId("claimed_disabled")
        .setLabel("✅  CLAIMED")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const disabledRow = new ActionRowBuilder().addComponents(disabledButton);

      await interaction.editReply({
        embeds: [updatedEmbed],
        components: [disabledRow],
      });

      console.log(`✅ CONTRACT CLAIMED: ${id} by ${interaction.user.tag}`);
    } catch (err) {
      console.error("❌ Error claiming contract:", err);
      await safeError(interaction, "Failed to claim contract. Please try again.");
    }

    return;
  }
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on("SIGTERM", () => {
  client.destroy();
  process.exit(0);
});
process.on("SIGINT", () => {
  client.destroy();
  process.exit(0);
});

client.login(process.env.TOKEN);
