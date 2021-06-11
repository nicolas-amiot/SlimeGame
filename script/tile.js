/**
* @class Tile
*/
class Tile {
	
	// IMPORTANT : Waiting support for the static fields classes by all browsers
	
	/**
	* @enum Names constants
	*/
	static get Name() {
		return {
			BEACH: "beach",
			ICE: "ice",
			GRASS: "grass",
			BLUE: "blue",
			RED: "red",
			YELLOW: "yellow",
			PURPLE: "purple",
			ORANGE: "orange",
			TELEPORT: "teleport",
			LAVA: "lava",
			INK: "ink",
			LIGHTNING: "lightning",
			BUTTON: "button",
			DOOR: "door"
		};
	}
	
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
			ORANGE_SLIME: "orange",
			TELEPORT: "teleport",
			DEATH: "death",
			INK: "ink",
			POWER: "power",
			BUTTON: "button",
			DOOR: "door",
			OPEN: "open"
		};
	}
	
	/**
	* @enum Properties constants
	*/
	static get PowerSupply() {
		return {
			NONE: "none",
			BOOLEAN: "boolean",
			INTEGER: "integer",
			LIST: "list"
		};
	}
	
	/**
	* Constructor for tile class
	*
	* @param {string} name - Tile name
	* @param {boolean} hasImage - If tile has image
	* @param {array} properties - Properties tile
	* @param {int} identifiable - If tile has identifier
	* @param {array} values - Identifier and powers of tile
	*/
	constructor(name, hasImage, properties, identifiable, values) {
		this.name = name; // Tile name
		if(hasImage) {
			this.path = "images/tiles/" + name + ".png"; // Image tile
			this.editorPath = null; // Image editor
		} else {
			this.path = null;
			this.editorPath = "images/editor/" + name + ".png";
		}
		this.identifiable = identifiable; // If tile can have a identifier
		this.properties = properties; // Properties tile
		if(identifiable && values != null && values.length > 0) {
			this.id = values[0]; // Identifier tile
			values = values.slice(1);
		} else if(identifiable) {
			this.id = 0;
		}
		if(values != null) {
			this.powers = values // Powers tile
		} else {
			this.powers = new Array();
		}
		this.powerSupply = null; // Power type
		this.groupOrder = null; // Order editor
		this.relation = null; // Relation with other tiles
		this.spawnable = null;
	}
	
	/**
	* Get normal or editor tile instance by name
	*/
	static instantiate(name, editor) {
		let tile = null;
		let values = null;
		let properties;
		if(name.includes(":")) {
			values = name.split(":");
			name = values[0];
			values = values.slice(1).map(power => parseInt(power));
		}
		if(name == Tile.Name.BEACH) {
			properties = [Tile.Property.WALK, Tile.Property.PUDDLE];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.NONE, "1-1", null, 2);
		} else if(name == Tile.Name.ICE) {
			properties = [Tile.Property.WALK, Tile.Property.ICE];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.NONE, "1-2", null, 2);
		} else if(name == Tile.Name.GRASS) {
			properties = [Tile.Property.WALK, Tile.Property.FOOD];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.INTEGER, "1-3", null, 2);
		} else if(name == Tile.Name.LAVA) {
			properties = [Tile.Property.WALK, Tile.Property.DEATH];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.NONE, "1-4", null, 1);
		} else if(name == Tile.Name.BLUE) {
			properties = [Tile.Property.WALK, Tile.Property.BLUE_SLIME];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.INTEGER, "2-1", null, 2);
		} else if(name == Tile.Name.RED) {
			properties = [Tile.Property.WALK, Tile.Property.RED_SLIME];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.INTEGER, "2-2", null, 2);
		} else if(name == Tile.Name.YELLOW) {
			properties = [Tile.Property.WALK, Tile.Property.YELLOW_SLIME];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.INTEGER, "2-3", null, 2);
		} else if(name == Tile.Name.PURPLE) {
			properties = [Tile.Property.WALK, Tile.Property.PURPLE_SLIME];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.INTEGER, "2-4", null, 2);
		} else if(name == Tile.Name.ORANGE) {
			properties = [Tile.Property.WALK, Tile.Property.ORANGE_SLIME];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.INTEGER, "2-5", null, 2);
		} else if(name == Tile.Name.TELEPORT) {
			properties = [Tile.Property.WALK, Tile.Property.TELEPORT];
			tile = new Tile(name, true, properties, true, values);
			tile.editorAttributes(editor, Tile.PowerSupply.INTEGER, "3-1", Tile.Name.TELEPORT, 1);
		} else if(name == Tile.Name.INK) {
			properties = [Tile.Property.WALK, Tile.Property.INK];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.NONE, "3-2", null, 2);
		} else if(name == Tile.Name.LIGHTNING) {
			properties = [Tile.Property.WALK, Tile.Property.POWER];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.INTEGER, "3-3", null, 2);
		} else if(name == Tile.Name.BUTTON) {
			properties = [Tile.Property.WALK, Tile.Property.BUTTON];
			tile = new Tile(name, true, properties, false, values);
			tile.editorAttributes(editor, Tile.PowerSupply.LIST, "3-4", Tile.Name.DOOR, 2);
		} else if(name == Tile.Name.DOOR) {
			properties = [Tile.Property.DOOR];
			tile = new Tile(name, false, properties, true, values);
			tile.editorAttributes(editor, Tile.PowerSupply.BOOLEAN, "3-5", null, 0);
		}
		return tile;
	}
	
	/**
	* Add editor attributes
	*
	* @param {boolean} editor - if editor attributes must be set
	* @param {PowerSupply} powerSupply - Power type
	* @param {string} groupOrder - Order editor
	* @param {string} relation - Relation with other tiles
	*/
	editorAttributes(editor, powerSupply, groupOrder, relation, spawnable) {
		if (editor) {
			this.powerSupply = powerSupply;
			this.groupOrder = groupOrder;
			this.relation = relation;
			this.spawnable = spawnable;
		}
	}
	
	/**
	* Active the effect of the case
	*
	* @param {Game} play - Game object
	*/
	init(x, y, play) {
		if(this.properties.includes(Tile.Property.DOOR) && this.powers[0] == 1) {
			play.puddles[x][y] = Game.Puddle.WHITE;
			play.tilemap.drawPuddle(x, y, Game.Puddle.WHITE);
		}
	}
	
	/**
	* Active the effect of the case
	*
	* @param {Game} play - Game object
	* @return {boolean} dead - If your character is dead
	*/
	activateCase(play) {
		let dead = false;
		let enemyDeath = false;
		let puddle = play.puddles[play.slime.posX][play.slime.posY];
		if(puddle != Game.Puddle.PURPLE) {
			if(this.properties.includes(Tile.Property.FOOD) && play.data.food > 0) {
				let power = this.powers[0];
				if(power > 0 && power > play.slime.food) {
					play.slime.food = power;
					play.screen.updateFood(play.slime.food);
				}
			} else if(this.properties.includes(Tile.Property.BLUE_SLIME)) {
				let power = this.powers[0];
				if(power > 0) {
					for(let x = 0; x < play.puddles.length; x++) {
						for(let y = 0; y < play.puddles[x].length; y++) {
							if(play.puddles[x][y] == Game.Puddle.BLUE) {
								play.puddles[x][y] = Game.Puddle.NONE;
								play.cases++;
								play.tilemap.drawPuddle(x, y, null);
								play.screen.updatePuddle(play.cases);
							}
						}
					}
					this.colorSlime(play, power, Slime.Color.BLUE);
				}
			} else if(this.properties.includes(Tile.Property.RED_SLIME)) {
				this.colorSlime(play, this.powers[0], Slime.Color.RED);
			} else if(this.properties.includes(Tile.Property.YELLOW_SLIME)) {
				this.colorSlime(play, this.powers[0], Slime.Color.YELLOW);
			} else if(this.properties.includes(Tile.Property.PURPLE_SLIME)) {
				this.colorSlime(play, this.powers[0], Slime.Color.PURPLE);
			} else if(this.properties.includes(Tile.Property.ORANGE_SLIME)) {
				this.colorSlime(play, this.powers[0], Slime.Color.ORANGE);
			} else if(this.properties.includes(Tile.Property.TELEPORT)) {
				let power = this.powers[0];
				if(power == null) {
					power = this.id;
				}
				for(let x = 0; x < play.data.tilesX; x++) {
					for(let y = 0; y < play.data.tilesY; y++) {
						let tile = play.tiles[x][y];
						if(tile != null && this.name == tile.name && power == tile.id && (x != play.slime.posX || y != play.slime.posY)) {
							play.slime.posX = x;
							play.slime.posY = y;
							play.tilemap.redrawSlimes(play.slime, play.enemy);
							x = play.data.tilesX;
							y = play.data.tilesY;
						}
					}
				}
			} else if(this.properties.includes(Tile.Property.BUTTON)) {
				for(let x = 0; x < play.data.tilesX; x++) {
					for(let y = 0; y < play.data.tilesY; y++) {
						let tile = play.tiles[x][y];
						if(tile != null && tile.properties.includes(Tile.Property.DOOR) && this.powers.includes(tile.id)) {
							if(play.puddles[x][y] == Game.Puddle.WHITE) {
								play.puddles[x][y] = Game.Puddle.NULL;
								play.tilemap.drawPuddle(x, y, null);
								if(play.data.enemy && play.enemy.posX == x  && play.enemy.posY == y) {
									enemyDeath = true;
								}
							} else {
								play.puddles[x][y] = Game.Puddle.WHITE;
								play.tilemap.drawPuddle(x, y, "white");
							}
						}
					}
				}
			} else if(this.properties.includes(Tile.Property.INK)) {
				for(let x = 0; x < play.puddles.length; x++) {
					for(let y = 0; y < play.puddles[x].length; y++) {
						if(play.puddles[x][y] == Play.Puddle.GREEN) {
							play.puddles[x][y] = Play.Puddle.YELLOW;
						} else if(play.puddles[x][y] == Play.Puddle.YELLOW) {
							play.puddles[x][y] = Play.Puddle.GREEN;
						}
					}
				}
				play.tilemap.redrawPuddles(play.puddles);
			} else if(this.properties.includes(Tile.Property.POWER)) {
				let power = this.powers[0];
				if(play.slime.power > 0) {
					if(play.slime.color == Slime.Color.BLUE) {
						for(let x = 0; x < play.puddles.length; x++) {
							for(let y = 0; y < play.puddles[x].length; y++) {
								if(play.puddles[x][y] == Game.Puddle.BLUE) {
									play.puddles[x][y] = Game.Puddle.NONE;
									play.cases++;
									play.tilemap.drawPuddle(x, y, null);
									play.screen.updatePuddle(play.cases);
								}
							}
						}
					}
					if(power == null) {
						power = 0;
					}
					play.slime.power = power;
					play.changeSlime(play.slime.color);
				}
			} else if(this.properties.includes(Tile.Property.DEATH)) {
				dead = true;
			}
		}
		if(enemyDeath) {
			play.killEnemy();
		}
		return dead;
	}
	
	/**
	* Active the effect of the case
	*
	* @param {Game} play - Game object
	* @param {int} power - Slime power
	* @param {string} color - Slime color
	*/
	colorSlime(play, power, color) {
		if(power > 0) {
			play.slime.power = power;
			let oldColor = play.slime.color;
			play.slime.color = color;
			play.changeSlime(oldColor);
		}
	}

}