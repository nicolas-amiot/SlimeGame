/**
* @class Game
*/
class Game {

	/**
	* @enum Directions constants
	*/
	static get Direction() {
		return {
			UP: "U",
			LEFT: "L",
			DOWN: "D",
			RIGHT: "R"
		};
	}

	/**
	* @enum Puddles constants
	*/
	static get Puddle() {
		return {
			NULL: 0,
			NONE: 1,
			GREEN: 2,
			BLUE: 3,
			WHITE: 4
		};
	}
	
	/**
	* Constructor for game class
	*
	* @param {IsometricMap} render - Isometric map render
	* @param {Screen} screen - Screen element
	*/
	constructor(render, screen) {
		this.render = render;
		this.screen = screen;
		
		// Configuration
		this.animate = 500;
		
		// Game attributes
		this.success = new Array(); // level success
		this.ready = false; // Game is ready to be played
		this.pending = false; // Animation pending
		this.slime = null; // Current slime
		this.puddles = null; // Current map puddles
		this.cases = 0; // Number of puddles before win
		this.level = 1; // Map level
		this.enemy = null; // Enemy slime
		this.dialog = 0; // Current dialog display
	}
	
	/**
	* Start the game
	*/
	start() {
		let self = this;
		this.ready = false;
		this.render.load(self.level, function() {
			self.restart();
			self.ready = true;
			self.screen.updateLevel(self.level);
			self.screen.displayLevel(true);
			self.screen.displayPuddle(true);
			self.screen.displayFood(self.render.food > 0);
			self.screen.displayLife(self.render.life > 0);
			self.dialog = 1;
			self.nextDialog();
		});
	}
	
	/**
	* Restart the game
	*/
	restart() {
		this.render.tileCtx.clearRect(0, 0, this.render.tileCtx.canvas.width, this.render.tileCtx.canvas.height);
		this.slime = new Slime(Slime.Color.GREEN, this.render.spawnX, this.render.spawnY);
		this.changeSlime(Slime.Color.GREEN);
		this.puddles = JSON.parse(JSON.stringify(this.render.puddles));
		if(this.puddles[this.slime.posX][this.slime.posY] == Game.Puddle.NONE) {
			this.puddles[this.slime.posX][this.slime.posY] = Game.Puddle.GREEN;
			this.render.drawPuddle(this.slime.posX, this.slime.posY, "green");
		}
		Tile.init(this);
		this.calculatePuddles();
		this.render.drawCharacter(this.getCharacter(this.slime), this.slime.posX, this.slime.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
		if(this.render.enemy) {
			this.enemy = new Slime(Slime.Color.GRAY, this.render.enemyX, this.render.enemyY);
			this.render.drawCharacter(this.getCharacter(this.enemy), this.enemy.posX, this.enemy.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
		}
		this.slime.food = this.render.food;
		this.screen.updateFood(this.slime.food);
		this.slime.life = this.render.life;
		this.screen.updateLife(this.slime.life);
		Tile.activateCase(this);
	}
	
	redraw() {
		this.render.run();
		this.redrawPuddles();
		this.render.drawCharacter(this.getCharacter(this.slime), this.slime.posX, this.slime.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
		if(this.render.enemy) {
			this.render.drawCharacter(this.getCharacter(this.enemy), this.enemy.posX, this.enemy.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
		}
	}
	
	/**
	* Move the slime according to the direction
	*
	* @param {string} direction - Slime direction
	* @param {int} number - Number of case to cross
	* @param {boolean} puddled - If case puddled
	*/
	moveDirection(direction) {
		if(!this.pending) {
			let move = this.slime.startMove();
			if(direction == Game.Direction.UP) {
				let mouvement = this.getMouvement(move.number, 1, 0);
				if(mouvement > 0) {
					this.slime.direction = direction;
					this.move(mouvement, 0, move.puddled);
				}
			} else if(direction == Game.Direction.LEFT) {
				let mouvement = this.getMouvement(move.number, 0, -1);
				if(mouvement > 0) {
					this.slime.direction = direction;
					this.move(0, -mouvement, move.puddled);
				}
			} else if(direction == Game.Direction.DOWN) {
				let mouvement = this.getMouvement(move.number, -1, 0);
				if(mouvement > 0) {
					this.slime.direction = direction;
					this.move(-mouvement, 0, move.puddled);
				}
			} else if(direction == Game.Direction.RIGHT) {
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
		if(this.dialog <= this.render.dialogs.length) {
			this.screen.updateBubble(this.render.dialogs[this.dialog - 1]);
			this.dialog++;
		} else if(this.dialog > this.render.dialogs.length) {
			this.screen.displayBubble(false);
		}
	}
	
	/* -------------------------------------------------- [Private] -------------------------------------------------- */
	
	/**
	* Get character image by the slime color and direction
	* @param {object} slime - The slime
	* @return {image} character - The character image
	*/
	getCharacter(slime) {
		return this.render.slimes.get(slime.color + slime.direction);
	}
	
	/**
	* Redraw the slime character
	*/
	redrawPuddles() {
		for(let x = 0; x < this.puddles.length; x++) {
			for(let y = 0; y < this.puddles[x].length; y++) {
				if(this.puddles[x][y] == Game.Puddle.GREEN) {
					this.render.drawPuddle(x, y, "green");
				} else if(this.puddles[x][y] == Game.Puddle.BLUE) {
					this.render.drawPuddle(x, y, "blue");
				} else if(this.puddles[x][y] == Game.Puddle.WHITE) {
					this.render.drawPuddle(x, y, "white");
				}
			}
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
		do {
			let x = this.slime.posX + nextX * (mouvement + 1);
			let y = this.slime.posY + nextY * (mouvement + 1);
			prop = this.render.getProperties(x, y);
			let puddle = null;
			if(x >= 0 && x < this.render.tilesX && y >= 0 && y < this.render.tilesY) {
				puddle = this.puddles[x][y];
			}
			
			if(prop.includes(Tile.Property.WALK) || puddle == Game.Puddle.WHITE) {
				mouvement++;
			} else {
				break;
			}
		} while (mouvement < number || prop.includes(Tile.Property.ICE));
		return mouvement;
	}
	
	/**
	* Move the slime according to the abscissa or ordinate
	*
	* @param {int} vx - Number of abscissa case to cross
	* @param {int} vy - Number of ordinate case to cross
	* @param {image} character - Character image
	* @param {boolean} puddled - If case puddled
	*/
	move(vx, vy, puddled) {
		this.pending = true;
		let self = this;
		let frame = this.animate != 0 ? Math.ceil(this.animate / 1000 * 60) : 1;
		let deformation = 40;
		let number = vx != 0 ? vx : vy;
		let sign = Math.sign(number);
		let speed = Math.abs(number) / frame;
		let moveEnemy = this.getNextEnemyTile(vx, vy);
		for(let i = 1; i <= frame; i++) {
			setTimeout(function(index) {
				let current;
				let next;
				let deform;
				// Draw character
				if(sign == -1) {
					current = Math.floor(sign * speed * index);
					next = Math.floor(sign * speed * (index + 1))
				} else {
					current = Math.ceil(sign * speed * index);
					next = Math.ceil(sign * speed * (index + 1))
				}
				if(index <= frame /2) {
					deform = deformation * index / frame;
				} else {
					deform = deformation - deformation * index / frame;
				}
				self.render.drawCharacter(self.getCharacter(self.slime), self.slime.posX + vx * index / frame, self.slime.posY + vy * index / frame, IsometricMap.CHAR_WIDTH + deform, IsometricMap.CHAR_HEIGHT, true);
				if(self.render.enemy) {
					self.render.drawCharacter(self.getCharacter(self.enemy), self.enemy.posX + (moveEnemy.x - self.enemy.posX) * index / frame, self.enemy.posY + (moveEnemy.y - self.enemy.posY) * index / frame, IsometricMap.CHAR_WIDTH + (moveEnemy.deform ? deform : 0), IsometricMap.CHAR_HEIGHT, false);
				}
				// Case crossed
				if(puddled && current != next) {
					let tileX = self.slime.posX;
					let tileY = self.slime.posY;
					if(vx != 0) {
						tileX += current;
					} else if(vy != 0) {
						tileY += current;
					}
					let puddle = self.puddles[tileX][tileY];
					if(puddle == Game.Puddle.NONE) {
						self.render.drawPuddle(tileX, tileY, "green");
						self.puddles[tileX][tileY] = Game.Puddle.GREEN;
						self.cases--;
						self.screen.updatePuddle(self.cases);
					} else if(puddle == Game.Puddle.GREEN) {
						self.render.drawPuddle(tileX, tileY, undefined);
						self.puddles[tileX][tileY] = Game.Puddle.NONE;
						self.cases++;
						self.screen.updatePuddle(self.cases);
						if(self.render.life != 0) {
							if(self.slime.life > 0) {
								self.slime.life--;
								self.screen.updateLife(self.slime.life);
							}
						}
					}
				}
				// Last case
				if(index == frame) {
					self.slime.posX += vx;
					self.slime.posY += vy;
					if(self.render.enemy) {
						self.enemy.posX = moveEnemy.x;
						self.enemy.posY = moveEnemy.y;
					}
					self.slime.endMove(self);
					let dead = Tile.activateCase(self);
					if(self.cases == 0) {
						self.addSuccess();
						self.level++;
						self.start();
					} else if(dead || (self.render.food != 0 && self.slime.food == 0) || (self.render.life != 0 && self.slime.life == 0) || (self.render.enemy && self.enemy.posX == self.slime.posX && self.enemy.posY == self.slime.posY)) {
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
		let map = JSON.parse(JSON.stringify(this.render.map));
		for(let x = 0; x < this.render.tilesX; x++) {
			for(let y = 0; y < this.render.tilesY; y++) {
				let idx = map[x][y];
				let puddle = this.puddles[x][y];
				if(puddle == Game.Puddle.BLUE || (this.render.getProperties(x, y).includes(Tile.Property.DOOR) && puddle != Game.Puddle.WHITE)) {
					map[x][y] = 0;
				} else if(idx > 1) {
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
		if(this.render.enemy) {
			move = {x: this.enemy.posX, y: this.enemy.posY, deform: false};
			let graph = this.getGraph();
			let start = graph.grid[this.enemy.posX][this.enemy.posY];
			let end = graph.grid[this.slime.posX + vx][this.slime.posY + vy];
			let path = null;
			if(!this.slime.evade()) {
				path = astar.search(graph, start, end);
				if(path.length > 0) {
					let gridNode = astar.search(graph, start, end)[0];
					move.x = gridNode.x;
					move.y = gridNode.y;
					move.deform = true;
				}
			}
			if(move.x - this.enemy.posX > 0) {
				this.enemy.direction = Game.Direction.UP;
			} else if(move.x - this.enemy.posX < 0) {
				this.enemy.direction = Game.Direction.DOWN;
			} else if(move.y - this.enemy.posY > 0) {
				this.enemy.direction = Game.Direction.RIGHT;
			} else if(move.y - this.enemy.posY < 0) {
				this.enemy.direction = Game.Direction.LEFT;
			}
		}
		return move;
	}
	
	/**
	* Respawn the ennemy and draw it
	*/
	killEnemy() {
		this.enemy.posX = this.render.enemyX;
		this.enemy.posY = this.render.enemyY;
		this.render.drawCharacter(this.getCharacter(this.slime), this.slime.posX, this.slime.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
		this.render.drawCharacter(this.getCharacter(this.enemy), this.enemy.posX, this.enemy.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
	}
	
	/**
	* Get the power of tiles
	* @return {array} powers - The powers of properties
	*/
	getPowers(properties) {
		let array = properties.filter((property) => property.startsWith("power"));
		for(let i = 0; i < array.length; i++) {
			let power = parseInt(array[i].replace("power",""));
			if(isNaN(power)) {
				array[i] = 0;
			} else {
				array[i] = power;
			}
		}
		return array;
	}
	
	/**
	* Get the powers of tiles
	* @return {int} power - The power of property
	*/
	getPower(properties) {
		let property = properties.filter((property) => property.startsWith("power"));
		if(property.length > 0) {
			let power = parseInt(property[0].replace("power",""));
			if(!isNaN(power)) {
				return power;
			}
		}
		return 0;
	}
	
	/**
	* Number of cases to fill with puddles
	*/
	calculatePuddles() {
		this.cases = 0;
		for(let x = 0; x < this.puddles.length; x++) {
			for(let y = 0; y < this.puddles[x].length; y++) {
				if(this.puddles[x][y] == Game.Puddle.NONE) {
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
			this.render.drawCharacter(this.getCharacter(this.slime), this.slime.posX, this.slime.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
			if(this.render.enemy) {
				this.render.drawCharacter(this.getCharacter(this.enemy), this.enemy.posX, this.enemy.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
			}
		} else if(oldColor != this.slime.color) {
			this.render.drawCharacter(this.getCharacter(this.slime), this.slime.posX, this.slime.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
			if(this.render.enemy) {
				this.render.drawCharacter(this.getCharacter(this.enemy), this.enemy.posX, this.enemy.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
			}
		}
		this.screen.updateSlime(this.slime.color, this.slime.power);
	}
	
	/**
	* Add this level in success
	*/
	addSuccess() {
		if(!this.success.includes(this.level)) {
			this.success.push(this.level);
		}
	}

}