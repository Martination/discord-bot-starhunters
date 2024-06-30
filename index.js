const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { CommandKit } = require("commandkit");
const config = require("./config.json");
require("dotenv").config();
const express = require("express");
const cron = require('node-cron');
const path = require("node:path");
const { autoCallStars } = require("./utils/auto-call-stars.js");
const { autoImportSMStars } = require("./utils/auto-importsm-stars.js");
const { connectToMongoDB } = require("./utils/db.js");
const pino = require("pino");

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

new CommandKit({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events"),
  validationsPath: path.join(__dirname, "validations"),
  devGuildIds: ["1180586373737107526"],
  devUserIds: ["220648788392411136"],
  devRoleIds: [],
  skipBuiltInValidations: true,
  bulkRegister: true,
});

// Google Cloud Run requires a health check endpoint
const app = express();
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log(`Express server is running on port 3000`);
});

client.once("ready", () => {
  client.user.setPresence({
    activities: [{ name: `stars! | /help`, type: ActivityType.Watching }],
  });
  logger.info("Bot is online");

  autoCallStars(client);
  // Every 1 minute
  cron.schedule('*/1 * * * *', () => {
    logger.info('Running /call after 1 minute');
    autoCallStars(client);
  });

  // Every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    logger.info('Running import-sm stars');
    autoImportSMStars();
  });

});

(async () => {
  try {
    await connectToMongoDB();
    console.log("MongoDB connection established");
    client.login(process.env.TOKEN);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
})();
