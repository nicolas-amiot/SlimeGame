/**
* @class Isometric tile renderer
*/
class IsometricMap {
	
	// IMPORTANT : Waiting support for the static fields classes by all browsers

	/**
	* @enum Tile width constants
	*/
	static get TILE_WIDTH() {
		return 200;
	}

	/**
	* @enum Tile height constants
	*/
	static get TILE_HEIGHT() {
		return 100;
	}

	/**
	* @enum Tile depth constants
	*/
	static get TILE_DEPTH() {
		return 30;
	}

	/**
	* @enum Character width constants
	*/
	static get CHAR_WIDTH() {
		return 120;
	}

	/**
	* @enum Character height constants
	*/
	static get CHAR_HEIGHT() {
		return 80;
	}
	
	/**
	* Constructor for isometric map
	*
	* @param {string} layer1 - layer used to create map render
	* @param {string} layer2 - layer used to show slime puddles
	* @param {string} layer3 - layer used to display the slime
	*/
	constructor(layer1, layer2, layer3) {
		// Constante
		this.tiles = Tile.getTiles(); // Tiles image by name
		
		// Context
		this.mapCtx = document.getElementById(layer1).getContext("2d"); // Map canvas
		this.tileCtx = document.getElementById(layer2).getContext("2d"); // Puddles canvas
		this.charCtx = document.getElementById(layer3).getContext("2d"); // Character canvas
		
		// Tiles and ratio
		this.tileWidth = IsometricMap.TILE_WIDTH; // Tiles height
		this.tileHeight = IsometricMap.TILE_HEIGHT; // Tiles width
		this.ratio = 1; // Ratio image size
		this.tilesX = 0; // Number of tiles in x axis
		this.tilesY = 0; // Number of tiles in y axis
		this.originX = 0; // Origin x to display the map
		this.originY = 0; // Origin y to display the map
		
		// Images
		this.slimes = null; // Characters images
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
		this.stroke = 0; // Maximum stroke number for get the star
		
		this.init();
	}

	/**
	* Load the game and images
	*
	* @param {int} level - The level to load
	* @param {function} callback - Function to execute after loading
	*/
	load(level, callback) {
		let self = this;
		
		$.getJSON("maps/level" + level + ".json", function(json) {
			let loadedImages = 0;
			let totalImages = 0;
			
			self.tilesX = json.map.length;
			self.tilesY = json.map[0].length;
			self.loadProperties(json);
			totalImages = self.loadTiles(json);
			self.loadMap(json);
			
			// Load character images first then tiles
			let image;
			for (const [key, value] of self.slimes.entries()) {
				image = new Image();
				image.onload = function() {
					if(++loadedImages >= self.slimes.size) {
						loadedImages = 0;
						for(let i = 0; i < self.tileImages.length; i++) {
							let src = self.tileImages[i];
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
				self.slimes.set(key, image);
				image.src = value; // After onload for cache
			}
		}).fail(function() {
			$("#modalLevel").modal("show");
			self.updateCanvasSize();
		});
	}
	
	/**
	* Draw background
	*/
	init() {
		let self = this;
		let width = $(window).width();
		let height = $(window).height();
		this.mapCtx.canvas.width = width;
		this.mapCtx.canvas.height = height;
		let image = new Image();
		image.src = "images/landscape-river.jpg";
		// Make sure the image is loaded
		image.onload = function(){
			self.mapCtx.drawImage(image, 0, 0, width, height);   
		}
	}
	
	/**
	* Run the isometric rendering
	*/
	run() {
		this.updateCanvasSize();
		this.redrawMap();
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
		w = w * this.ratio;
		h = h * this.ratio;
		let self = this;
		let offX = (x - 1) * this.tileWidth / 2 + y * this.tileWidth / 2 + this.originX;
		let offY = (y - 1) * this.tileHeight / 2 - x * this.tileHeight / 2 + this.originY;
		offX = offX + this.tileWidth * 0.25 - (w - this.tileHeight) / 2;
		offY = offY - this.tileHeight * 0.25 - (h - this.tileHeight);
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
		let border; // Remomve border line
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
		let offX = x * this.tileWidth / 2 + y * this.tileWidth / 2 + this.originX;
		let offY = y * this.tileHeight / 2 - x * this.tileHeight / 2 + this.originY;
		let top = offY + this.tileHeight / 2 + border / 2;
		let bot = offY - this.tileHeight / 2 - border / 2;
		let right = offX + this.tileWidth / 2 + border;
		let left = offX - this.tileWidth / 2 - border;

		
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
	* Get tile properties 
	*
	* @param {int} x - Position X of tile
	* @param {int} y - Position Y of tile
	* @return {array} properties - The properties tile
	*/
	getProperties(x, y) {
		if(x >= 0 && x < this.tilesX && y >= 0 && y < this.tilesY) {
			let index = this.map[x][y];
			return this.properties[index];
		} else {
			return [];
		}
	}
	
	/* -------------------------------------------------- [Private] -------------------------------------------------- */
	
	/**
	* Load the game properties
	*
	* @param {object} json properties
	*/
	loadProperties(json) {
		this.slimes = new Map();
		this.dialogs = new Array();
		
		// Spawn
		this.spawnX = json.spawn.y - 1; // Case start at index 1 in the json and x axis is the top left border
		if(this.spawnX < 0) {
			this.spawnX = 0;
		} else if(this.spawnX >= this.tilesX) {
			this.spawnX = this.tilesX - 1;
		}
		this.spawnY = json.spawn.x - 1; // Case start at index 1 in the json and x axis is the bot left border
		if(this.spawnY < 0) {
			this.spawnY = 0;
		} else if(this.spawnY >= this.tilesY) {
			this.spawnY = this.tilesY - 1;
		}
		
		// Food
		if(json.food != undefined && json.food != null && json.food > 0) {
			this.food = json.food;
		} else {
			this.food = 0;
		}
		
		// Life
		if(json.life != undefined && json.life != null && json.life > 0) {
			this.life = json.life;
		} else {
			this.life = 0;
		}
		
		// Dialogs
		if(json.dialogs != undefined && json.dialogs != null) {
			this.dialogs = json.dialogs;
		}
		
		// Stroke
		if(json.stroke != undefined && json.stroke != null) {
			this.stroke = json.stroke;
		}
		
		// Enemy
		if(json.enemy != undefined && json.enemy != null) {
			this.enemy = true;
			this.addCharacters(Slime.Color.GRAY);
			this.enemyX = json.enemy.y - 1; // Case start at index 1 in the json and x axis is the top left border
			if(this.enemyX < 0) {
				this.enemyX = 0;
			} else if(this.enemyX >= this.tilesX) {
				this.enemyX = this.tilesX - 1;
			}
			this.enemyY = json.enemy.x - 1; // Case start at index 1 in the json and x axis is the bot left border
			if(this.enemyY < 0) {
				this.enemyY = 0;
			} else if(this.enemyY >= this.tilesY) {
				this.enemyY = this.tilesY - 1;
			}
		} else {
			this.enemy = false;
		}
	}
	
	/**
	* Load tiles properties and images
	*
	* @param {object} json properties
	* @return {int} number of images to load
	*/
	loadTiles(json) {
		this.tileImages = new Array();
		this.properties = new Array();
		let totalImages = 0;
		
		this.addCharacters(Slime.Color.GREEN); // Default slimes
		this.properties[0] = []; // Index 0 is reserved for no tiles
		for(let i = 0; i < json.tiles.length; i++) {
			let path;
			let powers = null;
			if(json.tiles[i].includes(":")) {
				let array = json.tiles[i].split(":");
				path = array[0];
				powers = array.slice(1);
			} else {
				path = json.tiles[i];
			}
			let tile = this.tiles.get(path);
			if(tile != undefined) {
				let prop = JSON.parse(JSON.stringify(tile.properties));
				if(tile.path != undefined && tile.path != null) {
					this.tileImages[i] = tile.path;
					totalImages++;
				}
				this.properties[i + 1] = prop;
				if(prop.includes(Tile.Property.BLUE_SLIME)) {
					this.addCharacters(Slime.Color.BLUE);
				} else if(prop.includes(Tile.Property.RED_SLIME)) {
					this.addCharacters(Slime.Color.RED);
				} else if(prop.includes(Tile.Property.YELLOW_SLIME)) {
					this.addCharacters(Slime.Color.YELLOW);
				} else if(prop.includes(Tile.Property.PURPLE_SLIME)) {
					this.addCharacters(Slime.Color.PURPLE);
				}
				if(powers != null) {
					for(let j = 0; j < powers.length; j++) {
						this.properties[i + 1].push(Tile.Property.POWER + powers[j]);
					}
				}
			} else {
				this.properties[i + 1] = [];
				this.tileImages[i] = undefined;
			}
		}
		return totalImages;
	}
	
	/**
	* Load the puddles map
	*
	* @param {object} json properties
	*/
	loadMap(json) {
		this.map = new Array();
		this.puddles = new Array();
		
		for(let x = 0; x < this.tilesX; x++) {
			this.map[x] = json.map[this.tilesX - 1 - x]; // Reverse the array for corresponding to the json map
			this.puddles[x] = new Array();
			for(let y = 0; y < this.tilesY; y++) {
				var props = this.getProperties(x, y);
				if(props.includes(Tile.Property.PUDDLE)) {
					this.puddles[x][y] = Game.Puddle.NONE;
				} else {
					this.puddles[x][y] = Game.Puddle.NULL;
				}
			}
		}
	}
	
	/**
	* Update canvas size and center map
	*/
	updateCanvasSize() {
		let width = $(window).width();
		let height = $(window).height();
		let maxWidth = (this.tilesX + this.tilesY) / 2 * IsometricMap.TILE_WIDTH;
		let maxHeight = (this.tilesX + this.tilesY) / 2 * IsometricMap.TILE_HEIGHT + IsometricMap.TILE_DEPTH;
		if(width >= maxWidth && height >= maxHeight) {
			this.ratio = 1;
		} else if(width >= maxWidth * 0.75 && height >= maxHeight * 0.75) {
			this.ratio = 0.75;
		} else if(width >= maxWidth * 0.5 && height >= maxHeight * 0.5) {
			this.ratio = 0.5;
		} else {
			this.ratio = 0.25;
		}
		this.tileWidth = IsometricMap.TILE_WIDTH * this.ratio; // Tiles height
		this.tileHeight = IsometricMap.TILE_HEIGHT * this.ratio; // Tiles width

		// Canvas take all screen 
		this.mapCtx.canvas.width = width;
		this.mapCtx.canvas.height = height;
		this.tileCtx.canvas.width = width;
		this.tileCtx.canvas.height = height;
		this.charCtx.canvas.width = width;
		this.charCtx.canvas.height = height;

		// Center map
		var totalWidth = (this.tilesX + this.tilesY) / 2 - 1;
		var totalHeight = (this.tilesY - this.tilesX) / 2;
		this.originX = (width - totalWidth * this.tileWidth) / 2;
		this.originY = (height - totalHeight * this.tileHeight - IsometricMap.TILE_DEPTH * this.ratio) / 2;
	}

	/**
	* Redraw map
	*/
	redrawMap() {
		// Clear canvas
		this.mapCtx.clearRect(0, 0, this.mapCtx.canvas.width, this.mapCtx.canvas.height);

		// Draw tiles with display priority 
		for(let x = this.tilesX - 1; x >= 0; x--) {
			for(let y = 0; y < this.tilesY; y++) {
				let offX = (x - 1) * this.tileWidth / 2 + y * this.tileWidth / 2 + this.originX;
				let offY = (y - 1) * this.tileHeight / 2 - x * this.tileHeight / 2 + this.originY;

				let indexTile = this.map[x][y];
				// Index 0 is reserved for no tiles
				if(indexTile > 0)
				{
					let image = this.tileImages[indexTile - 1];
					if(image != undefined) {
						let ratioImage = this.tileWidth / image.width;
						this.mapCtx.drawImage(image, offX, offY, image.width * ratioImage, image.height * ratioImage);
					}
				}
			}
		}
	}
	
	/**
	* Add all frame for this slime color
	* @param {string} color - Color of the slime
	*/
	addCharacters(color) {
		this.slimes.set(color + Game.Direction.UP, "images/slimes/slime-" + color + "-up.png");
		this.slimes.set(color + Game.Direction.LEFT, "images/slimes/slime-" + color + "-left.png");
		this.slimes.set(color + Game.Direction.DOWN, "images/slimes/slime-" + color + "-down.png");
		this.slimes.set(color + Game.Direction.RIGHT, "images/slimes/slime-" + color + "-right.png");
	}

}