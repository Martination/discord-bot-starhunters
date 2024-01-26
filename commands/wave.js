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


waveSeed = '2024-01-25T16:45:02.191Z'
waveSeedDate = new Date(waveSeed)

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
    let waveTimer = interaction.options.get("timer")?.value;

    let curTime = new Date()
    if (waveTimer) {
      let newSeed = addMinutes(curTime, -waveTimer);
      waveSeedDate = newSeed;
    }

    console.log(waveSeedDate);
    let diff = new Date() - waveSeedDate;
    let ms = diff % 1000;
    let ss = Math.floor(diff / 1000) % 60;
    let mm = Math.floor(diff / 1000 / 60) % 60;
    let hh = Math.floor(diff / 1000 / 60 / 60);
    console.log(diff, `${hh}:${mm}:${ss} ${ms}\n\n\n`);

    // let curTime = new Date()
    let totalMin = differenceInMinutes(curTime, waveSeedDate);
    let waveElapsedMinutes = totalMin % 93;
    let waveElapsedTime = addMinutes(curTime, -waveElapsedMinutes);
    let waveEnd = addMinutes(curTime, (93 - waveElapsedMinutes));
    let spawnPhaseEnd = addMinutes(curTime, (45 - waveElapsedMinutes));

    // console.log(curTime, totalMin, waveElapsedMinutes, waveEnd, spawnPhaseEnd);

    let formattedString = `
    Wave started ${waveElapsedMinutes} ${(waveElapsedMinutes == 1) ? 'minute' : 'minutes'} ago.
    Spawn phase ${isAfter(spawnPhaseEnd, curTime) ? 'ends' : 'ended'} ${formatDistanceToNowStrict(spawnPhaseEnd, { addSuffix: true, })}.
    Wave ends in ${(93 - waveElapsedMinutes)} ${(waveElapsedMinutes == 92) ? 'minute' : 'minutes'}.

    _Last updated ${formatDistanceToNowStrict(waveSeedDate, { addSuffix: true, })}._`;

    // let formattedString = `
    // Wave started ${formatDistanceToNowStrict(waveElapsedTime, { addSuffix: true, })}.
    // Spawn phase ${isAfter(spawnPhaseEnd, curTime) ? 'ends' : 'ended'} ${formatDistanceToNowStrict(spawnPhaseEnd, { addSuffix: true, })}.
    // Wave ends ${formatDistanceToNowStrict(waveEnd, { addSuffix: true, })}.

    // Wave started ${waveElapsedMinutes} ${(waveElapsedMinutes == 1) ? 'minute' : 'minutes'} ago.
    // Spawn phase ${isAfter(spawnPhaseEnd, curTime) ? 'ends' : 'ended'} ${formatDistanceToNowStrict(spawnPhaseEnd, { addSuffix: true, })}.
    // Wave ends in ${(93 - waveElapsedMinutes)} ${(waveElapsedMinutes == 92) ? 'minute' : 'minutes'}.

    // _Last updated ${formatDistanceToNowStrict(waveSeedDate, { addSuffix: true, })}._`;

    console.log(formattedString);

    // ${ formatDistanceToNow(foundDate, { addSuffix: true, }) }


    // if (!waveTimer) { waveTimer = 0 }

    // let newDate = new Date() - (waveTimer * 1000 * 60);
    // console.log(waveTimer, newDate);
    // let diff = new Date() - newDate;
    // let ms = diff % 1000;
    // let ss = Math.floor(diff / 1000) % 60;
    // let mm = Math.floor(diff / 1000 / 60) % 60;
    // let hh = Math.floor(diff / 1000 / 60 / 60);
    // console.log(diff, hh, mm, ss, ms, "\n\n\n");

    const starsCollection = db.getStarsCollection();

    // Defer the reply to ensure enough time to process the command
    await interaction.deferReply();

    // console.log(waveSeed, waveSeedDate)
    // diff = new Date() - waveSeedDate;
    // ms = diff % 1000;
    // ss = Math.floor(diff / 1000) % 60;
    // mm = Math.floor(diff / 1000 / 60) % 60;
    // hh = Math.floor(diff / 1000 / 60 / 60);
    // console.log(diff, hh, mm, ss, ms);

    // let totalMin = Math.floor(diff / 1000 / 60)
    //     console.log(totalMin, totalMin / 93, totalMin % 93);

    //     console.log(
    //       `It has been ${totalMin} minutes since the wave update.
    // We have had ${Math.floor(totalMin / 93)} total waves.
    // We are ${totalMin % 93} minutes into the wave.
    // There are ${93 - (totalMin % 93)} minutes left of the wave.`);

    // totalMin = totalMin + 25;
    // let waveElapsedTime = totalMin % 93;
    // let waveEnd = 93 - waveElapsedTime;
    // let spawnPhaseEnd = waveEnd - 48;

    //   if (spawnPhaseEnd > 0) {
    //     console.log(
    //       `\nWave started ${waveElapsedTime} minutes ago.
    // Spawn phase ends in ${spawnPhaseEnd} minutes.
    // Wave ends in ${waveEnd} minutes.`);
    //   } else {
    //     console.log(
    //       `\nWave started ${waveElapsedTime} minutes ago.
    // Spawn phase ended ${-spawnPhaseEnd} minutes ago.
    // Wave ends in ${waveEnd} minutes.`);
    //   }






    // Wave started 12 minutes ago.

    // Spawn phase ends in 33 minutes.

    // Wave ends in 81 minutes.

    const embed = new EmbedBuilder()
      // .setTitle("Waves")
      .setColor("#5865f2");

    embed.addFields({
      name: `⭐ Wave Info`,
      value: formattedString
      //         `It has been ${totalMin} minutes since the wave update.\n
      // We have had ${Math.floor(totalMin / 93)} total waves.\n
      // We are ${totalMin % 93} minutes into the wave.\n
      // There are ${93 - (totalMin % 93)} minutes left of the wave.`
    });
    logger.info("/waves");
    interaction.editReply({ embeds: [embed] });

    // const releasedStars = await starsCollection
    //   .find({ calledAt: { $exists: true, $ne: null } })
    //   .sort({ foundAt: 1 })
    //   .toArray();

    // if (releasedStars.length > 0) {
    //   const embed = new EmbedBuilder()
    //     .setTitle("Released Stars")
    //     .setColor("#00ff00");

    //   releasedStars.forEach((star, index) => {
    //     const foundDate = new Date(star.foundAt);
    //     const updatedDate = new Date(star.updatedAt);
    //     // console.log(foundDate, updatedDate, star.foundAt, star.updatedAt);


    //     embed.addFields({
    //       name: `⭐ ${star.location}`,
    //       value: `World: ${star.world}
    //               Tier: ${star.tier}
    //               Found ${formatDistanceToNow(foundDate, {
    //         addSuffix: true,
    //       })} by <@${star.foundBy}>
    //               ${star.updatedAt ? 'Updated ' + formatDistanceToNow(updatedDate, { addSuffix: true, }) : ''}
    //               `,
    //     });
    //   });
    //   logger.info("/active");
    //   interaction.editReply({ embeds: [embed] });
    // } else {
    //   interaction.followUp("No active stars found");
    // }
  } catch (error) {
    console.error("Error querying MongoDB:", error);
    interaction.followUp("Error: Could not get active stars");
  }
}
module.exports = { data, run };
