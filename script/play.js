/**
* @class Play
*/
class Play {

	/**
	* @enum Directions constants
	*/
	static get Direction() {
		return {
			UP: "up",
			LEFT: "left",
			DOWN: "down",
			RIGHT: "right"
		};
	}

	/**
	* @enum Puddles constants
	*/
	static get Puddle() {
		return {
			NULL: "null",
			NONE: "none",
			GREEN: "green",
			BLUE: "blue",
			PURPLE: "purple",
			ORANGE: "darkorange",
			YELLOW: "goldenrod",
			WHITE: "white"
		};
	}
	
	/**
	* Constructor for play class
	*
	* @param {Screen} screen - Screen element
	* @param {Tilemap} tilemap - Isometric tile map
	*/
	constructor(screen, tilemap) {
		this.screen = screen;
		this.tilemap = tilemap;
		
		// Configuration
		this.animate = 500;
		this.cookie = true;
		this.success = ""; // level success
		
		// Play attributes
		this.ready = false; // Game is ready to be played
		this.pending = false; // Animation pending
		this.tiles = null;  // Current map tiles
		this.puddles = null;  // Current map puddles
		this.slime = null; // Current slime
		this.enemy = null; // Enemy slime
		this.cases = 0; // Number of puddles before win
		this.stroke = 0; // Current number of stroke
		this.dialog = 0; // Current dialog display
		
		// Map properties
		this.data = {
			tilesX : 0,
			tilesY : 0,
			spawnX : 0, // Spawn in x axis
			spawnY : 0, // Spawn in y axis
			spawnD : Play.Direction.RIGHT, // Spawn direction
			food : 0, // Food of your slime
			life : 0, // Life of your slime
			enemy : false, // Presence of the enemy slime in this level
			enemyX : 0, // Enemy spawn in x axis
			enemyY : 0, // Enemy spawn in y axis
			enemyD : Play.Direction.RIGHT, // Enemy direction
			dialogs : new Array(), // Dialogs to display at the start of the game
			stroke : 0, // Maximum stroke number for get the star
		};
		
		this.getCookie();
	}
	
	/**
	* Start the game
	*/
	start() {
		throw "Can't start since play instance";
	}
	
	/**
	* Restart the game
	*/
	restart() {
		throw "Can't restart since play instance";
	}
	
	/**
	* Update the game
	*/
	update() {
		throw "Can't update since play instance";
	}
	
	/**
	* End the game
	*/
	end() {
		throw "Can't end since play instance";
	}
	
	/**
	* Redraw map, puddles and slimes
	*/
	redraw() {
		this.tilemap.updateMapSize(0, 0);
		this.tilemap.loadBackground();
	}
	
	/**
	* Move the slime according to the direction
	*
	* @param {string} direction - Slime direction
	*/
	moveDirection(direction) {
		if(!this.pending) {
			let move = this.slime.startMove();
			if(direction == Play.Direction.UP) {
				let mouvement = this.getMouvement(move.number, 1, 0);
				if(mouvement > 0) {
					this.slime.direction = direction;
					this.move(mouvement, 0, move.puddled);
				}
			} else if(direction == Play.Direction.LEFT) {
				let mouvement = this.getMouvement(move.number, 0, -1);
				if(mouvement > 0) {
					this.slime.direction = direction;
					this.move(0, -mouvement, move.puddled);
				}
			} else if(direction == Play.Direction.DOWN) {
				let mouvement = this.getMouvement(move.number, -1, 0);
				if(mouvement > 0) {
					this.slime.direction = direction;
					this.move(-mouvement, 0, move.puddled);
				}
			} else if(direction == Play.Direction.RIGHT) {
				let mouvement = this.getMouvement(move.number, 0, 1);
				if(mouvement > 0) {
					this.slime.direction = direction;
					this.move(0, mouvement, move.puddled);
				}
			}
		}
	}
	
	/**
	* Use skill depending on the color of the slime
	*/
	useSkill() {
		if(!this.pending) {
			this.slime.useSkill(this);
		}
	}
	
	/**
	* Show the next dialog
	*/
	nextDialog() {
		if(this.dialog == 1) {
			this.screen.displayBubble(true);
		}
		if(this.dialog <= this.data.dialogs.length) {
			this.screen.updateBubble(this.data.dialogs[this.dialog - 1]);
			this.dialog++;
		} else if(this.dialog > this.data.dialogs.length) {
			this.screen.displayBubble(false);
		}
	}
	
	/**
	* Load the properties
	*
	* @param {object} json properties
	*/
	loadJSON(json) {
		this.data.tilesX = json.map.length;
		this.data.tilesY = json.map[0].length;
		
		// Spawn
		this.data.spawnX = json.spawn.y - 1; // Case start at index 1 in the json and x axis is the top left border
		if(this.data.spawnX < 0) {
			this.data.spawnX = 0;
		} else if(this.data.spawnX >= this.data.tilesX) {
			this.data.spawnX = this.data.tilesX - 1;
		}
		this.data.spawnY = json.spawn.x - 1; // Case start at index 1 in the json and x axis is the bot left border
		if(this.data.spawnY < 0) {
			this.data.spawnY = 0;
		} else if(this.data.spawnY >= this.data.tilesY) {
			this.data.spawnY = this.data.tilesY - 1;
		}
		if(json.spawn.direction != null) {
			switch (json.spawn.direction.toLowerCase()) {
				case Play.Direction.UP:
				case Play.Direction.RIGHT:
				case Play.Direction.DOWN:
				case Play.Direction.LEFT:
					this.data.spawnD = json.spawn.direction;
					break;
				default:
					this.data.spawnD = Play.Direction.RIGHT;
			}
		}
		
		// Food
		if(json.food != null && json.food > 0) {
			this.data.food = json.food;
		} else {
			this.data.food = 0;
		}
		
		// Life
		if(json.life != null && json.life > 0) {
			this.data.life = json.life;
		} else {
			this.data.life = 0;
		}
		
		// Dialogs
		if(json.dialogs != null) {
			this.data.dialogs = json.dialogs;
		} else {
			this.data.dialogs = new Array();
		}
		
		// Stroke
		if(json.stroke != null) {
			this.data.stroke = json.stroke;
		} else {
			this.data.stroke = 0;
		}
		
		// Enemy
		if(json.enemy != null) {
			this.data.enemy = true;
			this.data.enemyX = json.enemy.y - 1; // Case start at index 1 in the json and x axis is the top left border
			if(this.data.enemyX < 0) {
				this.data.enemyX = 0;
			} else if(this.data.enemyX >= this.data.tilesX) {
				this.data.enemyX = this.data.tilesX - 1;
			}
			this.data.enemyY = json.enemy.x - 1; // Case start at index 1 in the json and x axis is the bot left border
			if(this.data.enemyY < 0) {
				this.data.enemyY = 0;
			} else if(this.data.enemyY >= this.data.tilesY) {
				this.data.enemyY = this.data.tilesY - 1;
			}
			if(json.enemy.direction != null) {
				switch (json.enemy.direction.toLowerCase()) {
					case Play.Direction.UP:
					case Play.Direction.RIGHT:
					case Play.Direction.DOWN:
					case Play.Direction.LEFT:
						this.data.enemyD = json.enemy.direction;
						break;
					default:
						this.data.enemyD = Play.Direction.RIGHT;
				}
			}
		} else {
			this.data.enemy = false;
		}
		
		// Map
		this.tiles = new Array();
		for(let x = 0; x < this.data.tilesX; x++) {
			this.tiles[x] = new Array();
			for(let y = 0; y < this.data.tilesY; y++) {
				let tile = null;
				let index = json.map[this.data.tilesX - 1 - x][y] - 1; // Reverse the X abscissa array for corresponding to the json map
				if(index >= 0) {
					let name = json.tiles[index];
					this.tiles[x][y] =  this.getTileInstance(name);
				} else {
					this.tiles[x][y] = null;
				}
			}
		}
	}
	
	/**
	* Get tile instance
	*
	* @param {string} name - Name of tile
	*/
	getTileInstance(name) {
		return Tile.instantiate(name, false);
	}
	
	/**
	* Load the puddles map
	*/
	loadPuddles() {
		this.puddles = new Array();
		for(let x = 0; x < this.data.tilesX; x++) {
			this.puddles[x] = new Array();
			for(let y = 0; y < this.data.tilesY; y++) {
				if(this.getProperties(x, y).includes(Tile.Property.PUDDLE)) {
					this.puddles[x][y] = Play.Puddle.NONE;
				} else {
					this.puddles[x][y] = Play.Puddle.NULL;
				}
			}
		}
	}
	
	/**
	* Init the game
	*/
	init() {
		this.restart();
		this.screen.displayPuddle(true);
		this.screen.displayFood(this.data.food > 0);
		this.screen.displayLife(this.data.life > 0);
		this.dialog = 1;
		this.nextDialog();
		this.screen.displayLoader(false);
		this.ready = true;
	}
	
	/**
	* Reload the game
	*/
	reload() {
		this.stroke = 0;
		this.slime = new Slime(Slime.Color.GREEN, this.data.spawnX, this.data.spawnY, this.data.spawnD);
		this.changeSlime(Slime.Color.GREEN);
		if(this.data.enemy) {
			this.enemy = new Slime(Slime.Color.GRAY, this.data.enemyX, this.data.enemyY, this.data.enemyD);
		} else {
			this.enemy = null;
		}
		this.tilemap.redrawSlimes(this.slime, this.enemy);
		this.loadPuddles();
		if(this.puddles[this.slime.posX][this.slime.posY] == Play.Puddle.NONE) {
			this.puddles[this.slime.posX][this.slime.posY] = Play.Puddle.GREEN;
		}
		this.tilemap.redrawPuddles(this.puddles);
		for(let x = 0; x < this.data.tilesX; x++) {
			for(let y = 0; y < this.data.tilesY; y++) {
				let tile = this.tiles[x][y];
				if(tile != null) {
					tile.init(x, y, this);
				}
			}
		}
		this.calculatePuddles();
		
		this.slime.food = this.data.food;
		this.screen.updateFood(this.slime.food);
		this.slime.life = this.data.life;
		this.screen.updateLife(this.slime.life);
		let tile = this.tiles[this.slime.posX][this.slime.posY];
		tile.activateCase(this);
		if(this.cases == 0) {
			this.end();
		}
	}
	
	/**
	* Get the real number of case to cross
	*
	* @param {int} number - Number of case to cross
	* @param {int} nextX - Abscissa mouvement (-1, 0 or 1)
	* @param {int} nextY - Ordinate mouvement (-1, 0 or 1)
	* @return {int} mouvement - The number of abscissa or ordinate case 
	*/
	getMouvement(number, nextX, nextY) {
		let mouvement = 0;
		let prop;
		let puddle = null;
		do {
			let x = this.slime.posX + nextX * (mouvement + 1);
			let y = this.slime.posY + nextY * (mouvement + 1);
			prop = this.getProperties(x, y);
			if(x >= 0 && x < this.data.tilesX && y >= 0 && y < this.data.tilesY) {
				puddle = this.puddles[x][y];
			}
			if(prop.includes(Tile.Property.WALK) || puddle == Play.Puddle.WHITE) {
				mouvement++;
			} else {
				break;
			}
		} while (mouvement < number || (prop.includes(Tile.Property.ICE) && puddle != Play.Puddle.PURPLE));
		return mouvement;
	}
	
	/**
	* Move the slime according to the abscissa or ordinate
	*
	* @param {int} vx - Number of abscissa case to cross
	* @param {int} vy - Number of ordinate case to cross
	* @param {boolean} puddled - If case puddled
	*/
	move(vx, vy, puddled) {
		this.pending = true;
		let self = this;
		let frame = this.animate != 0 ? Math.ceil(this.animate / 1000 * 60) : 1;
		let deformation = 40;
		let moveEnemy = this.getNextEnemyTile(vx, vy);
		let posSlime = {x: this.slime.posX, y: this.slime.posY};
		let posEnemy;
		if(this.data.enemy) {
			posEnemy = {x: this.enemy.posX, y: this.enemy.posY};
		}
		for(let i = 1; i <= frame; i++) {
			setTimeout(function(index) {
				let oldM;
				let newM;
				if(vx != 0) {
					oldM = parseInt(vx * (index -1) / frame);
					newM = parseInt(vx * (index) / frame);
				} else if (vy != 0) {
					oldM = parseInt(vy * (index - 1) / frame);
					newM = parseInt(vy * (index) / frame);
				}
				let deform;
				// Draw character
				if(index <= frame /2) {
					deform = deformation * index / frame;
				} else {
					deform = deformation - deformation * index / frame;
				}
				self.slime.posX = posSlime.x + vx * index / frame;
				self.slime.posY = posSlime.y + vy * index / frame;
				self.tilemap.drawSlime(self.slime, deform);
				if(self.data.enemy) {
					self.enemy.posX = posEnemy.x + moveEnemy.vx * index / frame;
					self.enemy.posY = posEnemy.y + moveEnemy.vy * index / frame;
					self.tilemap.drawSlime(self.enemy, moveEnemy.deform ? deform : 0);
				}
				// Case crossed
				if(puddled && oldM != newM) {
					while(oldM != newM) { // If many crossed case in one frame
						let tileX;
						let tileY;
						if(oldM < newM) {
							oldM++;
						} else {
							oldM--;
						}
						if(vx != 0) {
							tileX = posSlime.x + oldM;
							tileY = posSlime.y;
						} else if (vy != 0) {
							tileX = posSlime.x;
							tileY = posSlime.y + oldM;
						}
						let puddle = self.puddles[tileX][tileY];
						if(puddle == Play.Puddle.NONE) {
							self.tilemap.drawPuddle(tileX, tileY, Play.Puddle.GREEN);
							self.puddles[tileX][tileY] = Play.Puddle.GREEN;
							self.cases--;
							self.screen.updatePuddle(self.cases);
						} else if(puddle == Play.Puddle.GREEN) {
							self.tilemap.drawPuddle(tileX, tileY, null);
							self.puddles[tileX][tileY] = Play.Puddle.NONE;
							self.cases++;
							self.screen.updatePuddle(self.cases);
							if(self.data.life != 0) {
								if(self.slime.life > 0) {
									self.slime.life--;
									self.screen.updateLife(self.slime.life);
								}
							}
						}
					}
				}
				// Last case
				if(index == frame) {
					self.stroke++;
					self.update();
					self.slime.endMove(self);
					let tile = self.tiles[self.slime.posX][self.slime.posY];
					let dead = tile.activateCase(self);
					if(self.cases == 0) {
						self.end();
					} else if(dead || (self.data.food != 0 && self.slime.food == 0) || (self.data.life != 0 && self.slime.life == 0) || (self.data.enemy && self.enemy.posX == self.slime.posX && self.enemy.posY == self.slime.posY)) {
						self.restart();
					}
					self.pending = false;
				}
			}, this.animate * i / frame, i);
		}
	}
	
	/**
	* Get graph for enemy path finding
	* @return {Graph} graph - The path finding graph
	*/
	getGraph() {
		let map = new Array();
		for(let x = 0; x < this.data.tilesX; x++) {
			map[x] = new Array();
			for(let y = 0; y < this.data.tilesY; y++) {
				let properties = this.getProperties(x, y);
				let puddle = this.puddles[x][y];
				if((!properties.includes(Tile.Property.WALK) && !(properties.includes(Tile.Property.DOOR) && puddle == Play.Puddle.WHITE)) || puddle == Play.Puddle.BLUE) {
					map[x][y] = 0;
				} else {
					map[x][y] = 1;
				}
			}
		}
		return new Graph(map);
	}
	
	/**
	* Get the next enemy move
	*
	* @param {int} vx - Number of abscissa case to cross
	* @param {int} vy - Number of ordinate case to cross
	* @return {object} move - The move object of enemy
	*/
	getNextEnemyTile(vx, vy) {
		let move = null;
		if(this.data.enemy) {
			move = {vx: 0, vy: 0, deform: false};
			let graph = this.getGraph();
			let start = graph.grid[this.enemy.posX][this.enemy.posY];
			let end = graph.grid[this.slime.posX + vx][this.slime.posY + vy];
			let path = null;
			if(!this.slime.evade()) {
				path = astar.search(graph, start, end);
				if(path.length > 0) {
					let gridNode = astar.search(graph, start, end)[0];
					move.vx = gridNode.x - this.enemy.posX;
					move.vy = gridNode.y - this.enemy.posY;
					move.deform = true;
				}
			}
			if(move.vx > 0) {
				this.enemy.direction = Play.Direction.UP;
			} else if(move.vx < 0) {
				this.enemy.direction = Play.Direction.DOWN;
			} else if(move.vy > 0) {
				this.enemy.direction = Play.Direction.RIGHT;
			} else if(move.vy < 0) {
				this.enemy.direction = Play.Direction.LEFT;
			}
		}
		return move;
	}
	
	/**
	* Respawn the ennemy and draw it
	*/
	killEnemy() {
		this.enemy.posX = this.data.enemyX;
		this.enemy.posY = this.data.enemyY;
		this.tilemap.redrawSlimes(this.slime, this.enemy);
	}
	
	/**
	* Number of cases to fill with puddles
	*/
	calculatePuddles() {
		this.cases = 0;
		for(let x = 0; x < this.puddles.length; x++) {
			for(let y = 0; y < this.puddles[x].length; y++) {
				if(this.puddles[x][y] == Play.Puddle.NONE) {
					this.cases++;
				}
			}
		}
		this.screen.updatePuddle(this.cases);
	}
	
	/**
	* Update the slime
	*
	* @param {string} oldSlime - Old slime color
	*/
	changeSlime(oldColor) {
		if(this.slime.color != Slime.Color.GREEN && this.slime.power == 0) {
			this.slime.color = Slime.Color.GREEN;
			this.tilemap.redrawSlimes(this.slime, this.enemy);
		} else if(oldColor != this.slime.color) {
			this.tilemap.redrawSlimes(this.slime, this.enemy);
		}
		this.screen.updateSlime(this.slime.color, this.slime.power);
	}
	
	/**
	* Get tile properties 
	*
	* @param {int} x - Position X of tile
	* @param {int} y - Position Y of tile
	* @return {array} properties - The properties tile
	*/
	getProperties(x, y) {
		if(x >= 0 && x < this.data.tilesX && y >= 0 && y < this.data.tilesY) {
			let tile = this.tiles[x][y];
			if(tile != null && tile.properties != null) {
				return tile.properties;
			} else {
				return [];
			}
		} else {
			return [];
		}
	}
	
	/**
	* Get cookie for the progress levels
	*/
	getCookie() {
		if(this.success.length == 0 && this.cookie) {
			this.success = Cookies.get('levels');
			if(this.success == null) {
				this.success = "";
			}
		}
	}

}