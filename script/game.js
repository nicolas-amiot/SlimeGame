/**
* @class Game
*/
class Game {
	
	/**
	* @enum Properties constants
	*/
	static Property = {
		WALK: "walk",
		PUDDLE: "puddle",
		ICE: "ice",
		FOOD: "food",
		BLUE_SLIME: "blue",
		RED_SLIME: "red",
		YELLOW_SLIME: "yellow",
		TELEPORT: "teleport",
		DEATH: "death",
		POWER: "power"
	};
	
	/**
	* @enum Directions constants
	*/
	static Direction = {
		UP: "U",
		LEFT: "L",
		DOWN: "D",
		RIGHT: "R"
	};
	
	/**
	* @enum Slime constants
	*/
	static Slime = {
		GREEN: "green",
		BLUE: "blue",
		RED: "red",
		YELLOW: "yellow",
		GRAY: "gray"
	};
	
	/**
	* @enum Puddles constants
	*/
	static Puddle = {
		NULL: 0,
		NONE: 1,
		GREEN: 2,
		BLUE: 3
	};
	
	/**
	* Constructor for game class
	*
	* @param {isometricMap} isometricMap - Isometric map render
	*/
	constructor(isometricMap, idLevel, idPuddle, idLife, idFood, idSlime, idAnimate, idBubble) {
		// Isometric Map
		this.isometricMap = isometricMap;
		
		// Display element
		this.elLevel = document.getElementById(idLevel);
		this.elPuddle = document.getElementById(idPuddle);
		this.elLife = document.getElementById(idLife);
		this.elFood = document.getElementById(idFood);
		this.elSlime = document.getElementById(idSlime);
		this.elAnimate = document.getElementById(idAnimate); // Animation time input
		this.elBubble = document.getElementById(idBubble);
		
		// Game attributes
		this.success = new Array(); // level success
		this.ready = false; // Game is ready to be played
		this.pending = false; // Animation pending
		this.slime = null; // Current slime color
		this.direction = null; // Current slime direction
		this.puddles = null; // Current map puddles
		this.cases = 0; // Number of puddles before win
		this.level = 1; // Map level
		this.posX = 0; // Current slime position in x axis
		this.posY = 0; // Current slime position in y axis
		this.food = 0; // Current food
		this.life = 0; // Current life
		this.power = 0; // Power of your skill
		this.skill = false; // Action button was pressed
		this.enemy = Game.Direction.RIGHT; // Enemy direction
		this.enemyX = 0; // Enemy position in x axis
		this.enemyY = 0; // Enemy position in y axis
		this.dialog = 0; // Current dialog display
	}
	
	/**
	* Start the game
	*/
	start() {
		var self = this;
		this.ready = false;
		this.isometricMap.load(self.level, function() {
			self.restart();
			self.ready = true;
			$(self.elLevel).text(self.level);
			$(self.elLevel).parent().removeClass("d-none");
			$(self.elPuddle).parent().removeClass("d-none");
			if(self.isometricMap.food > 0) {
				$(self.elFood).parent().removeClass("d-none");
			} else {
				$(self.elFood).parent().addClass("d-none");
			}
			if(self.isometricMap.life > 0) {
				$(self.elLife).parent().removeClass("d-none");
			} else {
				$(self.elLife).parent().addClass("d-none");
			}
			self.dialog = 1;
			self.updateBubble();
		});
	}
	
	/**
	* Restart the game
	*/
	restart() {
		this.isometricMap.tileCtx.clearRect(0, 0, this.isometricMap.tileCtx.canvas.width, this.isometricMap.tileCtx.canvas.height);
		this.slime = Game.Slime.GREEN;
		this.direction = Game.Direction.RIGHT;
		this.power = 0;
		this.skill = false;
		this.updateSlime(Game.Slime.GREEN);
		this.posX = this.isometricMap.spawnX;
		this.posY = this.isometricMap.spawnY;
		this.puddles = JSON.parse(JSON.stringify(this.isometricMap.puddles));
		if(this.puddles[this.posX][this.posY] == Game.Puddle.NONE) {
			this.puddles[this.posX][this.posY] = Game.Puddle.GREEN;
			this.isometricMap.drawPuddle(this.posX, this.posY, "green");
		}
		this.calculatePuddles();
		this.isometricMap.drawCharacter(this.getCharacter(), this.posX, this.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
		if(this.isometricMap.enemy) {
			this.enemy = Game.Direction.RIGHT;
			this.enemyX = this.isometricMap.enemyX;
			this.enemyY = this.isometricMap.enemyY;
			this.isometricMap.drawCharacter(this.isometricMap.characters.get(Game.Slime.GRAY + this.enemy), this.enemyX, this.enemyY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
		}
		this.food = this.isometricMap.food;
		this.updateFood();
		this.life = this.isometricMap.life;
		this.updateLife();
		this.activateCase();
	}
	
	/**
	* Get character image by the slime color and direction
	*/
	getCharacter() {
		return this.isometricMap.characters.get(this.slime + this.direction);
	}
	
	/**
	* Redraw the slime character
	*/
	redrawPuddles() {
		for(var x = 0; x < this.puddles.length; x++) {
			for(var y = 0; y < this.puddles[x].length; y++) {
				if(this.puddles[x][y] == Game.Puddle.GREEN) {
					this.isometricMap.drawPuddle(x, y, "green");
				} else if(this.puddles[x][y] == Game.Puddle.BLUE) {
					this.isometricMap.drawPuddle(x, y, "blue");
				}
			}
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
			var number = 1;
			var puddled = true;
			var characters = this.isometricMap.characters;
			if(this.slime == Game.Slime.RED && this.skill) {
				number += this.power;
			} else if(this.slime == Game.Slime.YELLOW) {
				puddled = false;
			}
			if(direction == Game.Direction.UP) {
				var mouvement = this.getMouvement(number, 1, 0);
				if(mouvement > 0) {
					this.direction = Game.Direction.UP;
					this.move(mouvement, 0, puddled);
				}
			} else if(direction == Game.Direction.LEFT) {
				var mouvement = this.getMouvement(number, 0, -1);
				if(mouvement > 0) {
					this.direction = Game.Direction.LEFT;
					this.move(0, -mouvement, puddled);
				}
			} else if(direction == Game.Direction.DOWN) {
				var mouvement = this.getMouvement(number, -1, 0);
				if(mouvement > 0) {
					this.direction = Game.Direction.DOWN;
					this.move(-mouvement, 0, puddled);
				}
			} else if(direction == Game.Direction.RIGHT) {
				var mouvement = this.getMouvement(number, 0, 1);
				if(mouvement > 0) {
					this.direction = Game.Direction.RIGHT;
					this.move(0, mouvement, puddled);
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
	*/
	getMouvement(number, nextX, nextY) {
		var mouvement = 0;
		do {
			var prop = this.isometricMap.getProperties(this.posX + nextX * (mouvement + 1), this.posY + nextY * (mouvement + 1));
			if(prop.includes(Game.Property.WALK)) {
				mouvement++;
			} else {
				break;
			}
		} while (mouvement < number || prop.includes(Game.Property.ICE));
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
		var self = this;
		var duration = $(this.elAnimate).val() * 1000;
		var frame = duration != 0 ? Math.ceil(duration / 1000 * 60) : 1;
		var deformation = 40;
		var number = vx != 0 ? vx : vy;
		var sign = Math.sign(number);
		var speed = Math.abs(number) / frame;
		var moveEnemy = this.getNextEnemyTile(vx, vy);
		for(var i = 1; i <= frame; i++) {
			setTimeout(function(index) {
				var current;
				var next;
				var deform;
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
				self.isometricMap.drawCharacter(self.getCharacter(), self.posX + vx * index / frame, self.posY + vy * index / frame, IsometricMap.CHAR_WIDTH + deform, IsometricMap.CHAR_HEIGHT, true);
				if(self.isometricMap.enemy) {
					self.isometricMap.drawCharacter(self.isometricMap.characters.get(Game.Slime.GRAY + self.enemy), self.enemyX + (moveEnemy.x - self.enemyX) * index / frame, self.enemyY + (moveEnemy.y - self.enemyY) * index / frame, IsometricMap.CHAR_WIDTH + (moveEnemy.deform ? deform : 0), IsometricMap.CHAR_HEIGHT, false);
				}
				// Case crossed
				if(puddled && current != next) {
					var tileX = self.posX;
					var tileY = self.posY;
					if(vx != 0) {
						tileX += current;
					} else if(vy != 0) {
						tileY += current;
					}
					var puddle = self.puddles[tileX][tileY];
					if(puddle == Game.Puddle.NONE) {
						self.isometricMap.drawPuddle(tileX, tileY, "green");
						self.puddles[tileX][tileY] = Game.Puddle.GREEN;
						self.cases--;
						self.updatePuddle();
					} else if(puddle == Game.Puddle.GREEN) {
						self.isometricMap.drawPuddle(tileX, tileY, undefined);
						self.puddles[tileX][tileY] = Game.Puddle.NONE;
						self.cases++;
						self.updatePuddle();
						if(self.isometricMap.life != 0) {
							if(self.life > 0) {
								self.life--;
								self.updateLife();
							}
						}
					}
				}
				// Last case
				if(index == frame) {
					self.posX += vx;
					self.posY += vy;
					if(self.isometricMap.enemy) {
						self.enemyX = moveEnemy.x;
						self.enemyY = moveEnemy.y;
					}
					if(self.isometricMap.food != 0 && self.slime != Game.Slime.YELLOW) {
						self.food--;
						self.updateFood();
					}
					if(self.slime == Game.Slime.RED && self.skill) {
						self.power = 0;
						self.skill = false;
						self.updateSlime(Game.Slime.RED);
						if(self.isometricMap.enemy && self.enemyX == self.posX  && self.enemyY == self.posY) {
							self.enemyX = self.isometricMap.enemyX;
							self.enemyY = self.isometricMap.enemyY;
							self.isometricMap.drawCharacter(self.getCharacter(), self.posX, self.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
							self.isometricMap.drawCharacter(self.isometricMap.characters.get(Game.Slime.GRAY + self.enemy), self.enemyX, self.enemyY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
						}
					} else if(self.slime == Game.Slime.YELLOW) {
						self.power--;
						self.updateSlime(Game.Slime.YELLOW);
					}
					var dead = self.activateCase();
					if(self.cases == 0) {
						self.addSuccess();
						self.level++;
						self.start();
					} else if(dead || (self.isometricMap.food != 0 && self.food == 0) || (self.isometricMap.life != 0 && self.life == 0) || (self.isometricMap.enemy && self.enemyX == self.posX && self.enemyY == self.posY)) {
						self.restart();
					}
					self.pending = false;
				}
			}, duration * i / frame, i);
		}
	}
	
	/**
	* Get graph for enemy path finding
	*/
	getGraph() {
		var map = JSON.parse(JSON.stringify(this.isometricMap.map));
		for(var x = 0; x < this.isometricMap.tilesX; x++) {
			for(var y = 0; y < this.isometricMap.tilesY; y++) {
				var idx = map[x][y];
				if(this.puddles[x][y] == Game.Puddle.BLUE) {
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
	*/
	getNextEnemyTile(vx, vy) {
		var move = null;
		if(this.isometricMap.enemy) {
			move = {x: this.enemyX, y: this.enemyY, deform: false};
			var graph = this.getGraph();
			var start = graph.grid[this.enemyX][this.enemyY];
			var end = graph.grid[this.posX + vx][this.posY + vy];
			var path = null;
			if(this.slime != Game.Slime.YELLOW) {
				path = astar.search(graph, start, end);
				if(path.length > 0) {
					var gridNode = astar.search(graph, start, end)[0];
					move.x = gridNode.x;
					move.y = gridNode.y;
					move.deform = true;
				}
			}
			if(move.x - self.enemyX > 0) {
				this.enemy = Game.Direction.UP;
			} else if(move.x - self.enemyX < 0) {
				this.enemy = Game.Direction.DOWN;
			} else if(move.y - self.enemyY > 0) {
				this.enemy = Game.Direction.RIGHT;
			} else if(move.y - self.enemyY < 0) {
				this.enemy = Game.Direction.LEFT;
			}
		}
		return move;
	}
	
	/**
	* Active the effect of the case
	*/
	activateCase() {
		var dead = false;
		var props = this.isometricMap.getProperties(this.posX, this.posY);
		if(props.includes(Game.Property.FOOD) && this.isometricMap.food > 0) {
			var power = this.getPower(props);
			if(power > 0 && power > this.food) {
				this.food = power;
				this.updateFood();
			}
		} else if(props.includes(Game.Property.BLUE_SLIME)) {
			var power = this.getPower(props);
			if(power > 0) {
				for(var x = 0; x < this.puddles.length; x++) {
					for(var y = 0; y < this.puddles[x].length; y++) {
						if(this.puddles[x][y] == Game.Puddle.BLUE) {
							this.puddles[x][y] = Game.Puddle.NONE;
							this.cases++;
							this.isometricMap.drawPuddle(x, y, undefined);
							this.updatePuddle();
						}
					}
				}
				this.power = power;
				var oldSlime = this.slime;
				this.slime = Game.Slime.BLUE;
				this.updateSlime(oldSlime);
			}
		} else if(props.includes(Game.Property.RED_SLIME)) {
			var power = this.getPower(props);
			if(power > 0) {
				this.power = power;
				var oldSlime = this.slime;
				this.slime = Game.Slime.RED;
				this.updateSlime(oldSlime);
			}
		} else if(props.includes(Game.Property.YELLOW_SLIME)) {
			var power = this.getPower(props);
			if(power > 0) {
				this.power = power;
				var oldSlime = this.slime;
				this.slime = Game.Slime.YELLOW;
				this.updateSlime(oldSlime);
			}
		} else if(props.includes(Game.Property.TELEPORT)) {
			var map = this.isometricMap.map;
			var index = map[this.posX][this.posY];
			for(var x = 0; x < this.isometricMap.tilesX; x++) {
				for(var y = 0; y < this.isometricMap.tilesY; y++) {
					var idx = map[x][y];
					if(index == idx && (x != this.posX || y != this.posY)) {
						this.isometricMap.drawCharacter(this.getCharacter(), x, y, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
						if(this.isometricMap.enemy) {
							this.isometricMap.drawCharacter(this.isometricMap.characters.get(Game.Slime.GRAY + this.enemy), this.enemyX, this.enemyY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
						}
						this.posX = x;
						this.posY = y;
						x = this.isometricMap.tilesX;
						y = this.isometricMap.tilesY;
					}
				}
			}
		} else if(props.includes(Game.Property.DEATH)) {
			dead = true;
		}
		return dead;
	}
	
	/**
	* Use skill depending on the color of the slime
	*/
	useSkill() {
		if(!this.pending) {
			if(this.slime == Game.Slime.BLUE) {
				if(this.puddles[this.posX][this.posY] != Game.Puddle.NULL) {
					if(this.puddles[this.posX][this.posY] == Game.Puddle.NONE) {
						this.isometricMap.drawPuddle(this.posX, this.posY, "blue");
						this.cases--;
					} else {
						this.isometricMap.drawPuddle(this.posX, this.posY, undefined);
						this.isometricMap.drawPuddle(this.posX, this.posY, "blue");
					}
					this.puddles[this.posX][this.posY] = Game.Puddle.BLUE;
					this.updatePuddle();
					this.power--;
					this.updateSlime(Game.Slime.BLUE);
				}
			} else if(this.slime == Game.Slime.RED) {
				this.skill = true;
			}
		}
	}
	
	/**
	* Get the power of tiles
	*/
	getPower(properties) {
		var property = properties.filter((property) => property.startsWith("power"));
		if(property.length > 0) {
			var power = parseInt(property[0].replace("power",""));
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
		for(var x = 0; x < this.puddles.length; x++) {
			for(var y = 0; y < this.puddles[x].length; y++) {
				if(this.puddles[x][y] == Game.Puddle.NONE) {
					this.cases++;
					this.updatePuddle();
				}
			}
		}
	}
	
	/**
	* Update the number of puddles
	*/
	updatePuddle() {
		$(this.elPuddle).text(this.cases);
	}
	
	/**
	* Update the food
	*/
	updateFood() {
		$(this.elFood).text(this.food);
	}
	
	/**
	* Update the life
	*/
	updateLife() {
		$(this.elLife).text(this.life);
	}
	
	/**
	* Show the next dialog
	*/
	updateBubble() {
		if(this.dialog == 1) {
			$(this.elBubble).removeClass("d-none");
		}
		if(this.dialog <= this.isometricMap.dialogs.length) {
			$(this.elBubble).children("span").html(this.isometricMap.dialogs[this.dialog - 1]);
			this.dialog++;
		} else if(this.dialog > this.isometricMap.dialogs.length) {
			$(this.elBubble).addClass("d-none");
		}
	}
	
	/**
	* Update the slime
	*
	* @param {string} oldSlime - Old slime color
	*/
	updateSlime(oldSlime) {
		if(this.slime != Game.Slime.GREEN && this.power == 0) {
			this.slime = Game.Slime.GREEN;
			this.isometricMap.drawCharacter(this.getCharacter(), this.posX, this.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
			if(this.isometricMap.enemy) {
				this.isometricMap.drawCharacter(this.isometricMap.characters.get(Game.Slime.GRAY + this.enemy), this.enemyX, this.enemyY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
			}
		} else if(oldSlime != this.slime) {
			this.isometricMap.drawCharacter(this.getCharacter(), this.posX, this.posY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, true);
			if(this.isometricMap.enemy) {
				this.isometricMap.drawCharacter(this.isometricMap.characters.get(Game.Slime.GRAY + this.enemy), this.enemyX, this.enemyY, IsometricMap.CHAR_WIDTH, IsometricMap.CHAR_HEIGHT, false);
			}
		}
		if(this.slime == Game.Slime.GREEN) {
			$(this.elSlime).children("img").attr("src","images/characters/slime-green-right.png");
			$(this.elSlime).children("span").text("");
		} else if(this.slime == Game.Slime.BLUE) {
			$(this.elSlime).children("img").attr("src","images/characters/slime-blue-right.png");
			$(this.elSlime).children("span").text("Utilisations restantes : " + this.power);
		} else if(this.slime == Game.Slime.RED) {
			$(this.elSlime).children("img").attr("src","images/characters/slime-red-right.png");
			$(this.elSlime).children("span").text("Puissance de la ruée : " + (this.power + 1));
		} else if(this.slime == Game.Slime.YELLOW) {
			$(this.elSlime).children("img").attr("src","images/characters/slime-yellow-right.png");
			$(this.elSlime).children("span").text("Nombre de tours restants : " + this.power);
		}
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
