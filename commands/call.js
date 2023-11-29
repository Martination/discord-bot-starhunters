const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
const { SlashCommandBuilder } = require("discord.js");
const locations = require("../data/locations.json");
const { saveStar } = require("../utils/save-star.js");
const ActiveStar = require("../schemas/ActiveStar.js");

const data = new SlashCommandBuilder()
  .setName("call")
  .setDescription("Call a star. This releases it to be viewed in /active")
  .addIntegerOption((option) =>
    option
      .setName("world")
      .setDescription("The world number of the star")
      .setRequired(true)
      .setMinValue(301)
      .setMaxValue(595)
  )
  .addIntegerOption((option) =>
    option
      .setName("tier")
      .setDescription("The tier of the star")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(9)
  )
  .addStringOption((option) =>
    option
      .setName("location")
      .setDescription("The location of the star")
      .setRequired(true)
  );
locations.forEach((loc) => {
  data.options[2].addChoices(loc);
});

async function run({ interaction }) {
  const world = interaction.options.get("world").value;
  const tier = interaction.options.get("tier").value;
  const location = interaction.options.get("location").value;

  await interaction.deferReply();

  const result = await saveStar(
    new ActiveStar(world, tier, location, interaction.user.id),
    interaction
  );

  interaction.editReply(result);
}
module.exports = { data, run };
