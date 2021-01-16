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
	constructor(color, posX, posY) {
		this.color = color; // Current slime color
		this.direction = Game.Direction.RIGHT; // Current slime direction
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
	* @param {Game} game - Game object
	*/
	endMove(game) {
		if(game.render.food != 0 && this.color != Slime.Color.YELLOW) {
			this.food--;
			game.screen.updateFood(this.food);
		}
		if(this.color == Slime.Color.RED && this.skill) {
			this.power = 0;
			this.skill = false;
			game.changeSlime(Slime.Color.RED);
			if(game.render.enemy && game.enemy.posX == this.posX  && game.enemy.posY == this.posY) {
				game.killEnemy();
			}
		} else if(this.color == Slime.Color.YELLOW) {
			this.power--;
			game.changeSlime(Slime.Color.YELLOW);
		}
	}
	
	/**
	* Slime event when use skill
	*
	* @param {Game} game - Game object
	*/
	useSkill(game) {
		if(this.color == Slime.Color.BLUE) {
			let puddle = game.puddles[this.posX][this.posY];
			if(puddle == Game.Puddle.NONE || puddle == Game.Puddle.GREEN) {
				if(puddle == Game.Puddle.NONE) {
					game.render.drawPuddle(this.posX, this.posY, "blue");
					game.cases--;
				} else {
					game.render.drawPuddle(this.posX, this.posY, undefined);
					game.render.drawPuddle(this.posX, this.posY, "blue");
				}
				game.puddles[this.posX][this.posY] = Game.Puddle.BLUE;
				game.screen.updatePuddle(game.cases);
				this.power--;
				game.changeSlime(Slime.Color.BLUE);
			}
		} else if(this.color == Slime.Color.RED) {
			this.skill = true;
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