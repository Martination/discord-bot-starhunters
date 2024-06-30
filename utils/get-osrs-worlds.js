const World = require("../schemas/Word.js");


async function HttpGetOSRSWorldsAsync() {
    const worlds = { member: [], free: [] };

    const response = await fetch('http://www.runescape.com/g=oldscape/slr.ws?order=LPWM');
    const arrayBuffer = await response.arrayBuffer();

    if (!arrayBuffer instanceof ArrayBuffer) throw new Error("Fetch was not sucessful.");

    const dataView = new DataView(arrayBuffer);

    if (!dataView instanceof DataView) throw new Error("Was not able to convert ArrayBuffer to DataView.");

    // Read Metadata
    const length = dataView.getInt32(0); // Reads 4 bytes
    const amountOfWorlds = dataView.getInt16(4); // Reads 2 bytes
    let offset = 6; // Start reading after the amountOfWorlds (4+2 bytes)
    
    // Read World Server Information
    do  {
        // console.log("length > offset:", length > offset, offset);
        // this is based off RLs code, however, javascript does not advance the read-head/pointer when read, so we have to keep track of the offset ourselves.
        const worldNumber = dataView.getInt16(offset, false); // read 2 bytes (starting from offset 6)
        const worldTypes = dataView.getInt32(offset + 2, false); //  Reads 4 bytes from offset + 2 (WorldNumber)
        const address = readString(dataView, offset + 6); // Read 1 byte until null-byte
        const activity = readString(dataView, address.offset + 1); // Read 1 byte until null-byte
        const location = dataView.getUint8(activity.offset + 1); // Read 1 byte from activity offset null-byte
        const playerCount = dataView.getUint16(activity.offset + 2, false); // Read 2 bytes from offset of activity null-byte + 1 byte
        
        // TODO change worldTypes to Enums and add types https://github.com/runelite/api.runelite.net/blob/master/http-service/src/main/java/net/runelite/http/service/worlds/ServiceWorldType.java
        const world = new World(worldNumber, worldTypes, address, activity, location, playerCount);
        // console.log(world);
        
        
        if (isF2p(worldTypes)) {
            worlds.free.push(world);
        }
        else {
            worlds.member.push(world);
        }

        // Update the offset for the next iteration
        offset = activity.offset + 2 + 2;
    } while (length > offset);

    return worlds;
}

// Read 1 Byte until Null-Byte is found
function readString(dataView, offset) {
    let b;
    const sb = [];
    while (true) {
        b = dataView.getUint8(offset);
        if (b === 0) break;
        sb.push(String.fromCharCode(b));
        offset += 1;
    }
    return {text: sb.join(''), offset};
}

// TODO find out all the world types by enum, and change world schema for types to list
function getWorldTypes(type) {
    const types = []
    if (type & 1) types.push("MEM")
    return types
}

function isF2p(worldTypes) {
    return (worldTypes & 1) === 0; // not a member world
}

module.exports = { HttpGetOSRSWorldsAsync, isF2p };

// Just some notes for me to wrap my head around byte reading
// getUint8(offset): Reads 1 byte (8 bits) unsigned
// getInt8(offset): Reads 1 byte (8 bits)
//
// getUint16(offset, false): Reads 2 bytes (16 bits) unsigned
// getInt16(offset, false): Reads 2 bytes (16 bits)
//
// getUint32(offset, false): Reads 4 bytes (32 bits) unsigned
// getInt32(offset, false): Reads 4 bytes (32 bits)
/*
    - World 1:
        World:    dataView.getInt16(6) = 393
        Address:   readString(dataView, 12) = {text: 'oldschool93.runescape.com', offset: 37}
        Activity: readString(dataView, 37 + 1) = {text: '750 skill total', offset: 53}
        Location: dataView.getUint8(53 + 1) = 0
        PlayerCount: dataView.getInt16(53 + 2) = 38
    - World 2:
        dataView.getInt16(53 + 2 + 2 = 57) = 468
        [...]
*/