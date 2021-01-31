/**
* @class Tile
*/
class Tile {
	
	/**
	* Get the list of all tiles with her path and properties
	*
	* @return {map} tiles - The tiles that can be used
	*/
	static getTiles() {
		let tiles = new Map();
		let folder = "images/tiles/";
		tiles.set("beach", {path: folder + "beach.png", properties: [Tile.Property.WALK, Tile.Property.PUDDLE]});
		tiles.set("ice", {path: folder + "ice.png", properties: [Tile.Property.WALK, Tile.Property.ICE]});
		tiles.set("grass", {path: folder + "grass.png", properties: [Tile.Property.WALK, Tile.Property.FOOD]});
		tiles.set("blue", {path: folder + "blue.png", properties: [Tile.Property.WALK, Tile.Property.BLUE_SLIME]});
		tiles.set("red", {path: folder + "red.png", properties: [Tile.Property.WALK, Tile.Property.RED_SLIME]});
		tiles.set("yellow", {path: folder + "yellow.png", properties: [Tile.Property.WALK, Tile.Property.YELLOW_SLIME]});
		tiles.set("purple", {path: folder + "purple.png", properties: [Tile.Property.WALK, Tile.Property.PURPLE_SLIME]});
		tiles.set("teleport", {path: folder + "teleport.png", properties: [Tile.Property.WALK, Tile.Property.TELEPORT]});
		tiles.set("lightning", {path: folder + "lightning.png", properties: [Tile.Property.WALK, Tile.Property.DEATH]});
		tiles.set("button", {path: folder + "button.png", properties: [Tile.Property.WALK, Tile.Property.BUTTON]});
		tiles.set("closedoor", {path: null, properties: [Tile.Property.DOOR]});
		tiles.set("opendoor", {path: null, properties: [Tile.Property.DOOR, Tile.Property.OPEN]});
		return tiles;
	}
	
	// IMPORTANT : Waiting support for the static fields classes by all browsers
	
	/**
	* @enum Properties constants
	*/
	static get Property() {
		return {
			WALK: "walk",
			PUDDLE: "puddle",
			ICE: "ice",
			FOOD: "food",
			BLUE_SLIME: "blue",
			RED_SLIME: "red",
			YELLOW_SLIME: "yellow",
			PURPLE_SLIME: "purple",
			TELEPORT: "teleport",
			DEATH: "death",
			BUTTON: "button",
			DOOR: "door",
			OPEN: "open",
			POWER: "power"
		};
	}
	
	/**
	* Active the effect of the case
	*
	* @param {Game} game - Game object
	*/
	static init(game) {
		for(let x = 0; x < game.render.tilesX; x++) {
			for(let y = 0; y < game.render.tilesY; y++) {
				let properties = game.render.getProperties(x, y);
				if(properties.includes(Tile.Property.DOOR) && properties.includes(Tile.Property.OPEN)) {
					game.puddles[x][y] = Game.Puddle.WHITE;
					game.render.drawPuddle(x, y, "white");
				}
			}
		}
	}
	
	/**
	* Active the effect of the case
	*
	* @param {Game} game - Game object
	* @return {boolean} dead - If your character is dead
	*/
	static activateCase(game) {
		let dead = false;
		let enemyDeath = false;
		let props = game.render.getProperties(game.slime.posX, game.slime.posY);
		let puddle = game.puddles[game.slime.posX][game.slime.posY];
		if(puddle != Game.Puddle.PURPLE) {
			if(props.includes(Tile.Property.FOOD) && game.render.food > 0) {
				let power = game.getPower(props);
				if(power > 0 && power > game.slime.food) {
					game.slime.food = power;
					game.screen.updateFood(game.slime.food);
				}
			} else if(props.includes(Tile.Property.BLUE_SLIME)) {
				let power = game.getPower(props);
				if(power > 0) {
					for(let x = 0; x < game.puddles.length; x++) {
						for(let y = 0; y < game.puddles[x].length; y++) {
							if(game.puddles[x][y] == Game.Puddle.BLUE) {
								game.puddles[x][y] = Game.Puddle.NONE;
								game.cases++;
								game.render.drawPuddle(x, y, undefined);
								game.screen.updatePuddle(game.cases);
							}
						}
					}
					game.slime.power = power;
					let oldColor = game.slime.color;
					game.slime.color = Slime.Color.BLUE;
					game.changeSlime(oldColor);
				}
			} else if(props.includes(Tile.Property.RED_SLIME)) {
				let power = game.getPower(props);
				if(power > 0) {
					game.slime.power = power;
					let oldColor = game.slime.color;
					game.slime.color = Slime.Color.RED;
					game.changeSlime(oldColor);
				}
			} else if(props.includes(Tile.Property.YELLOW_SLIME)) {
				let power = game.getPower(props);
				if(power > 0) {
					game.slime.power = power;
					let oldColor = game.slime.color;
					game.slime.color = Slime.Color.YELLOW;
					game.changeSlime(oldColor);
				}
			} else if(props.includes(Tile.Property.PURPLE_SLIME)) {
				let power = game.getPower(props);
				if(power > 0) {
					game.slime.power = power;
					let oldColor = game.slime.color;
					game.slime.color = Slime.Color.PURPLE;
					game.changeSlime(oldColor);
				}
			} else if(props.includes(Tile.Property.TELEPORT)) {
				let map = game.render.map;
				let index = map[game.slime.posX][game.slime.posY];
				for(let x = 0; x < game.render.tilesX; x++) {
					for(let y = 0; y < game.render.tilesY; y++) {
						let idx = map[x][y];
						if(index == idx && (x != game.slime.posX || y != game.slime.posY)) {
							game.render.drawCharacter(game.getCharacter(game.slime), x, y, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
							if(game.render.enemy) {
								game.render.drawCharacter(game.getCharacter(game.enemy), game.enemy.posX, game.enemy.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
							}
							game.slime.posX = x;
							game.slime.posY = y;
							x = game.render.tilesX;
							y = game.render.tilesY;
						}
					}
				}
			} else if(props.includes(Tile.Property.BUTTON)) {
				let powers = game.getPowers(props);
				for(let x = 0; x < game.render.tilesX; x++) {
					for(let y = 0; y < game.render.tilesY; y++) {
						let properties = game.render.getProperties(x, y);
						if(properties.includes(Tile.Property.DOOR) && powers.includes(game.getPower(properties))) {
							if(game.puddles[x][y] == Game.Puddle.WHITE) {
								game.puddles[x][y] = Game.Puddle.NULL;
								game.render.drawPuddle(x, y, undefined);
								if(game.render.enemy && game.enemy.posX == x  && game.enemy.posY == y) {
									enemyDeath = true;
								}
							} else {
								game.puddles[x][y] = Game.Puddle.WHITE;
								game.render.drawPuddle(x, y, "white");
							}
						}
					}
				}
			} else if(props.includes(Tile.Property.DEATH)) {
				dead = true;
			}
		}
		if(enemyDeath) {
			game.killEnemy();
		}
		return dead;
	}

}