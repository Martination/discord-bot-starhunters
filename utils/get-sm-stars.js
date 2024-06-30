const { HttpGetOSRSWorldsAsync } = require("../utils/get-osrs-worlds.js");
const Star = require("../schemas/Star.js");
const starlocations = require("../data/locations.json");
const Fuse = require('fuse.js');

/**
 * Does a Httprequest to get OSRS worlds from rs world api, filters free-to-play worlds.
 * @returns {Promise<Array<Star>>} The F2P worlds
 */
async function getF2PWorldsAsync() {
    const osrsworlds = await HttpGetOSRSWorldsAsync().catch(console.error);

    let f2pworlds = [];
    if (!osrsworlds) {
        // manual fallback, as found from StarMiners Map
        f2pworlds = [
            301, 308, 316, 326, 335, 371, 372, 379, 380, 381,
            382, 383, 384, 393, 394, 397, 398, 399, 413, 414,
            417, 418, 419, 427, 430, 431, 432, 433, 434, 435,
            436, 437, 451, 452, 453, 454, 455, 456, 468, 469,
            475, 476, 483, 497, 498, 499, 500, 501, 530, 537,
            544, 545, 546, 547, 552, 553, 554, 555, 571, 575
        ];
    }
    else f2pworlds = osrsworlds.free.map(x => x.world);

    return f2pworlds;
}

/**
 * Does a httprequest to starminers-map data endpoint
 * @returns {Promise<Array<Star>>} The Starminers called Stars
 */
async function HttpRequesStarMinersFetchDataAsync() {
    let result = [];

    // world, tier, location, credit
    const url = "https://map.starminers.site";
    const response = await fetch(`${url}/data2?timestamp=${Date.now()}`, {
        "headers": {
            // We're a legit user :^)
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,sv;q=0.8",
            "sec-ch-ua": "\"Microsoft Edge\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "Referer": "https://map.starminers.site/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        "body": null,
        "method": "GET"
    });

    const data = await response.json();
    /* Example response:
        [{
            "world": 567,
            "location": 6,
            "calledBy": "anonymous",
            "calledLocation": "Al Kharid bank",
            "calledAt": 1713261755.701,
            "minTime": 1713256998,
            "tier": 1,
            "maxTime": 1713257177
        }]
     */

    if (Array.isArray(data) && !data.length) throw new Error("Fetch was not sucessful.");
    const f2pworlds = await getF2PWorldsAsync();

    for (var star of data) {
        // Check for Free-to-play worlds
        if (f2pworlds.includes(star.world)) {
            // console.log(star)
            const { world, tier, calledBy: foundBy} = star;
            const location = ConvertLocation(star.calledLocation);
            const calledAtDate = new Date(star.calledAt * 1000); // Unix Timestamp to JS Date


            result.push(new Star(world, tier, location, "Starminers - " + foundBy, calledAtDate));
        }
    }

    return result;
}

/**
 * Convert Starminers name into F2P StarHunt schema, with fallback in case of manual reporting
 * @param {string} calledLocation The Called Location as given by Starminers
 * @returns {string} The Star Location in format of locations.json
 */
function ConvertLocation(calledLocation) {
    let res = calledLocation;

    // ref https://www.fusejs.io/api/options.html
    const fuseOptions = {
        includeScore: true,
        shouldSort: true, // Whether to sort the result list, by score. (default: true)
        keys: [ 'fuzzyaliases', 'name' ],
        minMatchCharLength: 2 // default: 1
    };
    
    // Fuzzy find calledLocation from locations.json
    const fuse = new Fuse(starlocations, fuseOptions);
    fuzzyLocations = fuse.search(calledLocation); // searchPattern is the called Location

    if (fuzzyLocations && fuzzyLocations.length >= 1)
        res = fuzzyLocations[0].item.value; // FuzzyFind is sorted by score, so we can take first

    // console.log("FuzzyFinder input:", calledLocation, "Output:", fuzzyLocations);

    return res;
}

module.exports = { HttpRequesStarMinersFetchDataAsync };