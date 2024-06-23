// const pino = require("pino");
// const logger = pino({
//   transport: {
//     target: "pino-pretty",
//   },
// });
const { EmbedBuilder } = require("discord.js");
const totalWorldList = require("../data/total-worlds.json");
const db = require("./db.js");
const { formatDistanceToNow } = require("date-fns");

module.exports = async () => {

  try {
    // return { content: "No active stars found" };

    const starsCollection = db.getStarsCollection();

    const releasedStars = await starsCollection
      .find({ calledAt: { $exists: true, $ne: null } })
      .sort({ foundAt: 1 })
      .toArray();

    if (releasedStars.length > 0) {
      const embed = new EmbedBuilder()
        .setTitle("Released Stars")
        .setColor("#00ff00");

      releasedStars.forEach((star, index) => {
        const foundDate = new Date(star.foundAt);
        const updatedDate = new Date(star.updatedAt);

        // Estimate current tier based on last updated time
        let lastUpdate = star.updatedAt ? updatedDate : foundDate;
        let tierDiff = parseInt((new Date() - lastUpdate) / (1000 * 60 * 7));
        let estimatedTier = Math.max(star.tier - tierDiff, 0);

        totalWorld = "";
        if (totalWorldList[0]["500 total worlds"].includes(star.world)) {
          totalWorld = "(500 total)";
        } else if (totalWorldList[0]["750 total worlds"].includes(star.world)) {
          totalWorld = "(750 total)";
        }

        embed.addFields({
          name: `⭐ ${star.location}`,
          value: `World: ${star.world} ${totalWorld}
                  Tier: ${estimatedTier}${estimatedTier == star.tier ? '' : '*'}
                  Found ${formatDistanceToNow(foundDate, { addSuffix: true, })} by <@${star.foundBy}>
                  ${star.updatedAt ? 'Updated ' + formatDistanceToNow(updatedDate, { addSuffix: true, }) : ''}
                  `,
        });
      });
      // logger.info("/utils/active-stars-embed");
      return { embeds: [embed] };
    } else {
      return { content: "No active stars found" };
    }
  } catch (error) {
    console.error("Error querying MongoDB:", error);
    return { content: "Error: Could not get active stars" };
  }
};
