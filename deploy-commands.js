// deploy-commands.js
// Run this ONCE locally (or as a Railway one-off job) to register slash commands.
// Command: node deploy-commands.js
//
// You need these in your .env:
//   TOKEN=your_bot_token
//   CLIENT_ID=your_bot_application_id   (from Discord Developer Portal → Your App → General Information)
//   GUILD_ID=your_server_id             (right-click your server icon → Copy Server ID)

const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
  new SlashCommandBuilder()
    .setName("postcontract")
    .setDescription("Post a new flight contract to the server")
    .addStringOption((opt) =>
      opt.setName("type").setDescription("Contract type (e.g. Cargo, Passenger)").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("route").setDescription("Flight route (e.g. PANC -> PAJN)").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("aircraft").setDescription("Required aircraft (e.g. C208, B737)").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("description").setDescription("Contract briefing / details").setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName("reward").setDescription("Reward amount").setRequired(true)
    )
    .addRoleOption((opt) =>
      opt.setName("pingrole").setDescription("Role to ping (optional)").setRequired(false)
    ),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("📡 Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log("✅ Slash commands registered successfully.");
    console.log("   You can now restart your bot and run /postcontract in Discord.");
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
    process.exit(1);
  }
})();
