/**
* @class Slime
*/
class Slime {
	
	// IMPORTANT : Waiting support for the static fields classes by all browsers
	
	/**
	* @enum Slime constants
	*/
	static get Color() {
		return {
			GREEN: "green",
			BLUE: "blue",
			RED: "red",
			YELLOW: "yellow",
			PURPLE: "purple",
			ORANGE: "orange",
			GRAY: "gray"
		};
	}
	
	/**
	* Constructor for slime class
	*
	* @param {string} color - Slime color
	* @param {int} posX - X axis position
	* @param {int} posY - Y axis position
	*/
	constructor(color, posX, posY, direction) {
		this.color = color; // Current slime color
		this.direction = direction; // Current slime direction
		this.posX = posX; // Current slime position in x axis
		this.posY = posY; // Current slime position in y axis
		this.food = 0; // Current food
		this.life = 0; // Current life
		this.power = 0; // Power of your skill
		this.skill = false; // Action button was pressed
	}
	
	/**
	* Slime event before moving
	*
	* @return {object} move - Return the number of case and if puddled
	*/
	startMove() {
		let move = {
			number: 1,
			puddled: true
		}
		if(this.color == Slime.Color.RED && this.skill) {
			move.number += this.power;
		} else if(this.color == Slime.Color.YELLOW) {
			move.puddled = false;
		}
		return move;
	}
	
	/**
	* Slime event after moving
	*
	* @param {Play} play - Play object
	*/
	endMove(play) {
		if(play.data.food != 0 && this.color != Slime.Color.YELLOW) {
			this.food--;
			play.screen.updateFood(this.food);
		}
		if(this.color == Slime.Color.RED && this.skill) {
			this.power = 0;
			this.skill = false;
			play.changeSlime(Slime.Color.RED);
			if(play.data.enemy && play.enemy.posX == this.posX  && play.enemy.posY == this.posY) {
				play.killEnemy();
			}
		} else if(this.color == Slime.Color.YELLOW) {
			this.power--;
			play.changeSlime(Slime.Color.YELLOW);
		}
	}
	
	/**
	* Slime event when use skill
	*
	* @param {Play} play - Play object
	*/
	useSkill(play) {
		if(this.color == Slime.Color.BLUE) {
			let puddle = play.puddles[this.posX][this.posY];
			if(puddle == Play.Puddle.NONE || puddle == Play.Puddle.GREEN) {
				if(puddle == Play.Puddle.NONE) {
					play.tilemap.drawPuddle(this.posX, this.posY, "blue");
					play.cases--;
				} else {
					play.tilemap.drawPuddle(this.posX, this.posY, null);
					play.tilemap.drawPuddle(this.posX, this.posY, "blue");
				}
				play.puddles[this.posX][this.posY] = Play.Puddle.BLUE;
				play.screen.updatePuddle(play.cases);
				this.power--;
				play.changeSlime(Slime.Color.BLUE);
			}
		} else if(this.color == Slime.Color.RED) {
			this.skill = true;
		} else if(this.color == Slime.Color.PURPLE) {
			let activation = false;
			if(play.puddles[this.posX][this.posY] == Play.Puddle.PURPLE) {
				activation = true;
			}
			let caseX = this.posX;
			let caseY = this.posY;
			if(this.direction == Play.Direction.UP) {
				caseX += this.power;
			} else if(this.direction == Play.Direction.LEFT) {
				caseY -= this.power;
			} else if(this.direction == Play.Direction.DOWN) {
				caseX -= this.power;
			} else if(this.direction == Play.Direction.RIGHT) {
				caseY += this.power;
			}
			let properties = play.getProperties(caseX, caseY);
			let puddle = null;
			if(caseX >= 0 && caseX < play.data.tilesX && caseY >= 0 && caseY < play.data.tilesY) {
				puddle = play.puddles[caseX][caseY];
			}
			if(puddle != null && properties.includes(Tile.Property.WALK)) {
				for(let x = 0; x < play.puddles.length; x++) {
					for(let y = 0; y < play.puddles[x].length; y++) {
						if(play.puddles[x][y] == Play.Puddle.PURPLE) {
							let props = play.getProperties(x, y);
							if(props.includes(Tile.Property.PUDDLE)) {
								play.puddles[x][y] = Play.Puddle.NONE;
								play.cases++;
							} else {
								play.puddles[x][y] = Play.Puddle.NULL;
							}
							play.tilemap.drawPuddle(x, y, null);
						}
					}
				}
				if(play.puddles[caseX][caseY] != Play.Puddle.NULL && play.puddles[caseX][caseY] != Play.Puddle.NONE) {
					play.tilemap.drawPuddle(caseX, caseY, null);
				} else if(properties.includes(Tile.Property.PUDDLE)) {
					play.cases--;
				}
				play.screen.updatePuddle(play.cases);
				play.puddles[caseX][caseY] = Play.Puddle.PURPLE;
				play.tilemap.drawPuddle(caseX, caseY, "purple");
				this.power = 0;
				play.changeSlime(Slime.Color.PURPLE);
				if(play.data.enemy && play.enemy.posX == caseX  && play.enemy.posY == caseY) {
					play.enemy.posX = this.posX;
					play.enemy.posY = this.posY;
					this.posX = caseX;
					this.posY = caseY;
					play.tilemap.redrawSlimes(play.slime, play.ghost, play.enemy);
				}
				if(play.cases == 0) {
					play.addSuccess();
					play.level++;
					play.start();
				} else if(activation) {
					let dead = play.tiles[this.posX][this.posY].activateCase(play);
					if(dead) {
						play.restart();
					}
				}
			}
		}
	}
	
	/**
	* Slime event for enemy
	*
	* @param {boolean} evade - If enemy see you
	*/
	evade() {
		return this.color == Slime.Color.YELLOW;
	}

}