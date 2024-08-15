const ActiveStar = require("../schemas/ActiveStar.js");
const Star = require("../schemas/Star.js");
const db = require("./db.js");
const { getStarInWorld } = require("./get-star-in-world.js");

/**
 * Saves the star to the database
 * @param  {Star || ActiveStar}           starToSave  The star object
 * @param  {ChatInputCommandInteraction}  interaction The Discord interaction object
 * @return {Object || null}                           The document from the DB
 */
saveStar = async (starToSave, interaction) => {
  const starsCollection = db.getStarsCollection();
  let message;

  const starExists = await getStarInWorld(starToSave.world);

  // if the star already exists
  if (starExists) {
    // save without changing foundAt
    delete starToSave.foundAt;
  }

  try {
    await starsCollection.updateOne(
      { world: starToSave.world },
      { $set: starToSave },
      { upsert: true }
    );
    if (starToSave instanceof ActiveStar) {
      message = `${interaction.user} called a new **/active** star: W${starToSave.world} T${starToSave.tier} ${starToSave.location}`;
    } else {
      message = `You're holding a star on W${starToSave.world}`;
    }
  } catch (error) {
    console.error(error);
    message = "Error: Could not insert the star";
  }
  return message;
};

module.exports = { saveStar };
