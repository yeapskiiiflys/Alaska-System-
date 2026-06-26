require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("postcontract")
    .setDescription("Post a custom flight contract")
    .addStringOption(function(o) {
      return o.setName("type").setDescription("Passenger / VIP / Charter / Emergency").setRequired(true);
    })
    .addStringOption(function(o) {
      return o.setName("route").setDescription("Example: MDPC to LCPH").setRequired(true);
    })
    .addStringOption(function(o) {
      return o.setName("aircraft").setDescription("Example: B777-300ER").setRequired(true);
    })
    .addStringOption(function(o) {
      return o.setName("description").setDescription("Flight description").setRequired(true);
    })
    .addIntegerOption(function(o) {
      return o.setName("reward").setDescription("Reward amount (no $)").setRequired(true);
    })
    .addRoleOption(function(o) {
      return o.setName("pingrole").setDescription("Role to ping (optional)").setRequired(false);
    })
    .addIntegerOption(function(o) {
      return o.setName("allowedroles").setDescription("Required level (display only)").setRequired(false);
    }),

  new SlashCommandBuilder()
    .setName("postrules")
    .setDescription("Post the Alaska Airlines Virtual community rules"),

].map(function(cmd) { return cmd.toJSON(); });

if (!process.env.TOKEN) {
  console.error("TOKEN is missing in .env or Railway variables");
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

const CLIENT_ID = "1492387132180926626";
const GUILD_ID  = "1491959579385528500";

(async function() {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Commands registered successfully!");
  } catch (error) {
    console.error("Deploy error:", error);
  }
})();
