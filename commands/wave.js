const pino = require("pino");
const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});
const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const db = require("../utils/db.js");
const { addMinutes, differenceInMinutes, isAfter, formatDistanceToNowStrict } = require("date-fns");


let waveSeed = '2024-01-25T16:45:02.191Z'
let waveSeedDate = new Date(waveSeed)

const data = new SlashCommandBuilder()
  .setName("wave")
  .setDescription("Get the progress of the current wave")
  .addIntegerOption((option) =>
    option
      .setName("timer")
      .setDescription("How many minutes ago the new wave began")
  );

async function run({ interaction }) {
  try {
    const waveTimer = interaction.options.get("timer")?.value;
    const curTime = new Date()

    if (waveTimer) {
      let newSeed = addMinutes(curTime, -waveTimer);
      waveSeedDate = newSeed;
    }

    let totalMin = differenceInMinutes(curTime, waveSeedDate);
    let waveElapsedMinutes = totalMin % 93;
    let spawnPhaseEnd = addMinutes(curTime, (45 - waveElapsedMinutes));
    let waveEndMinutes = 93 - waveElapsedMinutes

    let formattedString = `
Wave started ${waveElapsedMinutes} ${(waveElapsedMinutes == 1) ? 'minute' : 'minutes'} ago.
Spawn phase ${isAfter(spawnPhaseEnd, curTime) ? 'ends' : 'ended'} ${formatDistanceToNowStrict(spawnPhaseEnd, { addSuffix: true, })}.
Wave ends in ${(waveEndMinutes)} ${(waveEndMinutes == 1) ? 'minute' : 'minutes'}.

_Last updated ${formatDistanceToNowStrict(waveSeedDate, { addSuffix: true, })}._`;

    console.log(formattedString);

    // Defer the reply to ensure enough time to process the command
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      // .setTitle("")
      .setColor("#5865f2");

    embed.addFields({
      name: `🌊 Wave Info`,
      value: formattedString
    });

    logger.info("/waves");
    interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error getting wave info:", error);
    interaction.followUp("Error: Could not wave info");
  }
}
module.exports = { data, run };
