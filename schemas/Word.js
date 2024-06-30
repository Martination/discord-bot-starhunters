class World {
    constructor(
      world,
      type,
      address,
      activity,
      location,
      players
    ) {
      this.world = world;
      this.type = type;
      this.address = address;
      this.activity = activity;
      this.location = location;
      this.players = players;
    }
  }
  
  module.exports = World;
