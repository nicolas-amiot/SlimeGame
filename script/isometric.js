/**
* @class Isometric tile renderer
*/
class IsometricMap {
	
	/**
	* Constructor for isometric map
	*
	* @param {string} layer1 - layer used to create map render
	* @param {string} layer2 - layer used to show slime puddles
	* @param {string} layer3 - layer used to display the slime
	*/
	constructor(layer1, layer2, layer3) {
		// Constante
		this.tileWidth = 100; // Tiles width
		this.tileHeight = this.tileWidth * 2; // Tiles height
		this.tiles = this.init(); // Tiles image by name
		
		// Context
		this.mapCtx = document.getElementById(layer1).getContext("2d"); // Map canvas
		this.tileCtx = document.getElementById(layer2).getContext("2d"); // Puddles canvas
		this.charCtx = document.getElementById(layer3).getContext("2d"); // Character canvas
		
		// Tiles
		this.tilesX = 0; // Number of tiles in x axis
		this.tilesY = 0; // Number of tiles in y axis
		this.originX = 0; // Origin x to display the map
		this.originY = 0; // Origin y to display the map
		
		// Images
		this.characters = null; // Characters images
		this.tileImages = null; // Tiles images
		
		// Game
		this.map = null; // Map with index tile
		this.properties = null; // Properties for index tile
		this.puddles = null; // Puddles map
		this.spawnX = 0; // Spawn in x axis
		this.spawnY = 0; // Spawn in y axis
		this.food = 0; // Food of your slime
		this.life = 0; // Life of your slime
		this.enemy = false; // Presence of the enemy slime in this level
		this.enemyX = 0; // Enemy spawn in x axis
		this.enemyY = 0; // Enemy spawn in y axis
		this.dialogs = null; // Dialogs to display at the start of the game
	}
	
	/**
	* Init the tiles with a path and properties
	*
	* @return {map} tiles - The tiles that can be used
	*/
	init() {
		var tiles = new Map();
		var folder = "images/tiles/";
		tiles.set("beach", {path: folder + "beach.png", properties: [Game.Property.WALK, Game.Property.PUDDLE]});
		tiles.set("ice", {path: folder + "ice.png", properties: [Game.Property.WALK, Game.Property.ICE]});
		tiles.set("grass", {path: folder + "grass.png", properties: [Game.Property.WALK, Game.Property.FOOD]});
		tiles.set("road", {path: folder + "road.png", properties: [Game.Property.WALK]});
		tiles.set("blue", {path: folder + "blue.png", properties: [Game.Property.WALK, Game.Property.BLUE_SLIME]});
		tiles.set("red", {path: folder + "red.png", properties: [Game.Property.WALK, Game.Property.RED_SLIME]});
		tiles.set("yellow", {path: folder + "yellow.png", properties: [Game.Property.WALK, Game.Property.YELLOW_SLIME]});
		tiles.set("teleport", {path: folder + "teleport.png", properties: [Game.Property.WALK, Game.Property.TELEPORT]});
		tiles.set("lightning", {path: folder + "lightning.png", properties: [Game.Property.WALK, Game.Property.DEATH]});
		return tiles;
	}

	/**
	* Load the game and images
	*
	* @param {int} level - The level to load
	* @param {function} callback - Function to execute after loading
	*/
	load(level, callback) {
		var self = this;
		this.characters = new Map();
		this.tileImages = new Array();
		this.map = new Array();
		this.properties = new Array();
		this.puddles = new Array();
		this.dialogs = new Array();
		
		$.getJSON("maps/level" + level + ".json", function(json) {
			var loadedImages = 0;
			var totalImages = 0;
			
			self.tilesX = json.map.length;
			self.tilesY = json.map[0].length;
			self.spawnX = json.spawn.y - 1; // Case start at index 1 in the json and x axis is the top left border
			if(self.spawnX < 0) {
				self.spawnX = 0;
			} else if(self.spawnX >= self.tilesX) {
				self.spawnX = self.tilesX - 1;
			}
			self.spawnY = json.spawn.x - 1; // Case start at index 1 in the json and x axis is the bot left border
			if(self.spawnY < 0) {
				self.spawnY = 0;
			} else if(self.spawnY >= self.tilesY) {
				self.spawnY = self.tilesY - 1;
			}
			if(json.food != undefined && json.food != null && json.food > 0) {
				self.food = json.food;
			} else {
				self.food = 0;
			}
			if(json.life != undefined && json.life != null && json.life > 0) {
				self.life = json.life;
			} else {
				self.life = 0;
			}
			if(json.dialogs != undefined && json.dialogs != null) {
				self.dialogs = json.dialogs;
			}
			if(json.enemy != undefined && json.enemy != null) {
				self.enemy = true;
				self.addCharacters(Game.Slime.GRAY);
				self.enemyX = json.enemy.y - 1; // Case start at index 1 in the json and x axis is the top left border
				if(self.enemyX < 0) {
					self.enemyX = 0;
				} else if(self.enemyX >= self.tilesX) {
					self.enemyX = self.tilesX - 1;
				}
				self.enemyY = json.enemy.x - 1; // Case start at index 1 in the json and x axis is the bot left border
				if(self.enemyY < 0) {
					self.enemyY = 0;
				} else if(self.enemyY >= self.tilesY) {
					self.enemyY = self.tilesY - 1;
				}
			} else {
				self.enemy = false;
			}
			
			// Set puddles map
			for(var x = 0; x < self.tilesX; x++) {
				self.map[x] = json.map[self.tilesX - 1 - x]; // Reverse the array for corresponding to the json map
				self.puddles[x] = new Array();
				for(var y = 0; y < self.tilesY; y++) {
					var index = self.map[x][y] - 1;
					if(index >= 0) { // Index 0 is reserved for no tiles
						var tile = self.tiles.get(json.tiles[index]);
						if(tile != undefined) {
							var prop = tile.properties;
							if(prop.includes(Game.Property.PUDDLE)) {
								self.puddles[x][y] = Game.Puddle.NONE;
							} else {
								self.puddles[x][y] = Game.Puddle.NULL;
							}
						} else {
							self.puddles[x][y] = Game.Puddle.NULL;
						}
					} else {
						self.puddles[x][y] = Game.Puddle.NULL;
					}
				}
			}
			
			// Set tiles properties and images
			self.addCharacters(Game.Slime.GREEN); // Default characters
			self.properties[0] = []; // Index 0 is reserved for no tiles
			for(var i = 0; i < json.tiles.length; i++) {
				var path;
				var power = 0;
				if(json.tiles[i].includes(":")) {
					var array = json.tiles[i].split(":");
					path = array[0];
					power = array[1];
				} else {
					path = json.tiles[i];
				}
				var tile = self.tiles.get(path);
				if(tile != undefined) {
					var prop = JSON.parse(JSON.stringify(tile.properties));
					self.tileImages[i] = tile.path;
					totalImages++;
					self.properties[i + 1] = prop;
					if(prop.includes(Game.Property.BLUE_SLIME)) {
						self.addCharacters(Game.Slime.BLUE);
					} else if(prop.includes(Game.Property.RED_SLIME)) {
						self.addCharacters(Game.Slime.RED);
					} else if(prop.includes(Game.Property.YELLOW_SLIME)) {
						self.addCharacters(Game.Slime.YELLOW);
					}
					if(power > 0) {
						self.properties[i + 1].push(Game.Property.POWER + power);
					}
				} else {
					self.properties[i + 1] = [];
					self.tileImages[i] = undefined;
				}
			}
			
			// Load character images first then tiles
			var image;
			for (const [key, value] of self.characters.entries()) {
				image = new Image();
				image.onload = function() {
					if(++loadedImages >= self.characters.size) {
						loadedImages = 0;
						for(var i = 0; i < self.tileImages.length; i++) {
							var src = self.tileImages[i];
							if(src != undefined) {
								image = new Image();
								image.onload = function() {
									if(++loadedImages >= totalImages) { // All images have been loaded
										self.run();
										callback(); 
									}
								};
								self.tileImages[i] = image;
								image.src = src; // After onload for cache
							}
						}
					}
				};
				self.characters.set(key, image);
				image.src = value; // After onload for cache
			}
		}).fail(function() {
			$("#modalLevel").modal("show");
			self.updateCanvasSize();
		});
	}
	
	/**
	* Run the isometric rendering
	*/
	run() {
		this.updateCanvasSize();
		this.redrawMap();
	}
	
	/**
	* Update canvas size and center map
	*/
	updateCanvasSize() {
		var width = $(window).width();
		var height = $(window).height();

		// Canvas take all screen 
		this.mapCtx.canvas.width = width;
		this.mapCtx.canvas.height = height;
		this.tileCtx.canvas.width = width;
		this.tileCtx.canvas.height = height;
		this.charCtx.canvas.width = width;
		this.charCtx.canvas.height = height;

		// Center map
		this.originX = width / 2 - (this.tilesX - 1) * this.tileHeight / 2;
		this.originY = height /2;
	}

	/**
	* Redraw map
	*/
	redrawMap() {
		// Clear canvas
		this.mapCtx.clearRect(0, 0, this.mapCtx.canvas.width, this.mapCtx.canvas.height);

		// Draw tiles with display priority 
		for(var x = this.tilesX - 1; x >= 0; x--) {
			for(var y = 0; y < this.tilesY; y++) {
				var offX = (x - 1) * this.tileHeight / 2 + y * this.tileHeight / 2 + this.originX;
				var offY = (y - 1) * this.tileWidth / 2 - x * this.tileWidth / 2 + this.originY;

				var indexTile = this.map[x][y];
				// Index 0 is reserved for no tiles
				if(indexTile > 0)
				{
					var image = this.tileImages[indexTile - 1];
					if(image != undefined) {
						var ratio = this.tileHeight / image.width;
						this.mapCtx.drawImage(image, offX, offY, image.width * ratio, image.height * ratio);
					}
				}
			}
		}
	}
	
	/**
	* Draw the character
	*
	* @param {image} img - Image to draw
	* @param {int} x - Position X
	* @param {int} y - Position Y
	* @param {int} w - Image width
	* @param {int} h - Image height
	* @param {boolean} clear - Clear canvas
	*/
	drawCharacter(img, x, y, w, h, clear) {
		var self = this;
		var offX = (x - 1) * this.tileHeight / 2 + y * this.tileHeight / 2 + this.originX;
		var offY = (y - 1) * this.tileWidth / 2 - x * this.tileWidth / 2 + this.originY;
		offX = offX + this.tileHeight * 0.25 - (w - this.tileWidth) / 2;
		offY = offY - this.tileWidth * 0.25 - (h - this.tileWidth);
		if(clear) {
			this.charCtx.clearRect(0, 0, this.charCtx.canvas.width, this.charCtx.canvas.height);
		}
		this.charCtx.drawImage(img, offX, offY, w, h);
	}
	
	/**
	* Draw or clear the puddle
	*
	* @param {int} x - Position X of tile
	* @param {int} y - Position Y of tile
	* @param {string} color - Color puddle or undefined for clear
	*/
	drawPuddle(x, y, color) {
		var border; // Remomve border line
		if(color != undefined) {
			this.tileCtx.globalCompositeOperation='source-over';
			this.tileCtx.globalAlpha = 0.5;
			this.tileCtx.strokeStyle = color;
			this.tileCtx.fillStyle = color;
			this.tileCtx.lineWidth = 1;
			border = 0;
		} else { // If the color is undefined then the area is clear
			this.tileCtx.globalCompositeOperation='destination-out';
			this.tileCtx.globalAlpha = 1;
			border = 1;
		}
		var offX = x * this.tileHeight / 2 + y * this.tileHeight / 2 + this.originX;
		var offY = y * this.tileWidth / 2 - x * this.tileWidth / 2 + this.originY;
		var top = offY + this.tileWidth / 2 + border / 2;
		var bot = offY - this.tileWidth / 2 - border / 2;
		var right = offX + this.tileHeight / 2 + border;
		var left = offX - this.tileHeight / 2 - border;

		
		this.tileCtx.beginPath();
		this.tileCtx.moveTo(offX, top);
		this.tileCtx.lineTo(right, offY);
		this.tileCtx.lineTo(offX, bot);
		this.tileCtx.lineTo(left, offY);
		this.tileCtx.closePath();
		this.tileCtx.stroke();
		this.tileCtx.fill();
	}
	
	/**
	* Add all frame for this slime color
	* @param {string} color - Color of the slime
	*/
	addCharacters(color) {
		this.characters.set(color + Game.Direction.UP, "images/characters/slime-" + color + "-up.png");
		this.characters.set(color + Game.Direction.LEFT, "images/characters/slime-" + color + "-left.png");
		this.characters.set(color + Game.Direction.DOWN, "images/characters/slime-" + color + "-down.png");
		this.characters.set(color + Game.Direction.RIGHT, "images/characters/slime-" + color + "-right.png");
	}
	
	/**
	* Get tile properties 
	*
	* @param {int} x - Position X of tile
	* @param {int} y - Position Y of tile
	*/
	getProperties(x, y) {
		if(x >= 0 && x < this.tilesX && y >= 0 && y < this.tilesY) {
			var index = this.map[x][y];
			return this.properties[index];
		} else {
			return [];
		}
	}

}
