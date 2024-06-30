
// const { saveStar } = require("../utils/save-star.js");
const { HttpRequesStarMinersFetchDataAsync } = require("../utils/get-sm-stars.js");

const db = require("./db.js");
const { getStarInWorld } = require("./get-star-in-world.js");

async function autoImportSMStars() {
    const stars = await HttpRequesStarMinersFetchDataAsync().catch(console.error);
    const starsCollection = db.getStarsCollection();
    
    if (!stars) {
        return;
    }
   
    for (let star of stars) {
        // Can't use saveStar due to ChatInputCommandInteraction parameter
        // const result = await saveStar(
        //     star,
        //     interaction
        // );

        if (star && !star.credit) {
            star.credit = 'Starminers';
        }

        // Grabbed from saveStar function
        const starExists = await getStarInWorld(star.world);
        // if the star already exists and is the same location
        if (starExists && starExists.location === star.location) {
            // save without changing foundAt
            delete star.foundAt;
        }
        
        await starsCollection.updateOne(
            { world: star.world },
            { $set: star },
            { upsert: true }
        ).catch(console.error);
        // ============================

    }
};

module.exports = { autoImportSMStars };
