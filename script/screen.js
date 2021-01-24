/**
* @class Screen
*/
class Screen {
	
	/**
	* Constructor for screen class
	*
	* @param {string} idLevel - Level identifier
	* @param {string} idPuddle - Puddle identifier
	* @param {string} idLife - Life identifier
	* @param {string} idFood - Food identifier
	* @param {string} idSlime - Slime identifier
	* @param {string} idBubble - Bubble identifier
	*/
	constructor(idLevel, idPuddle, idLife, idFood, idSlime, idBubble) {
		this.level = document.getElementById(idLevel);
		this.puddle = document.getElementById(idPuddle);
		this.life = document.getElementById(idLife);
		this.food = document.getElementById(idFood);
		this.slime = document.getElementById(idSlime);
		this.bubble = document.getElementById(idBubble);
	}
	
	/**
	* Display or not the level element
	*
	* @param {boolean} displayed - Slime identifier
	*/
	displayLevel(displayed) {
		if(displayed) {
			$(this.level).parent().removeClass("d-none");
		} else {
			$(this.level).parent().addClass("d-none");
		}
	}
	
	/**
	* Update the number of level
	*/
	updateLevel(level) {
		$(this.level).text(level);
	}
	
	/**
	* Display or not the puddle element
	*
	* @param {boolean} displayed - Slime identifier
	*/
	displayPuddle(displayed) {
		if(displayed) {
			$(this.puddle).parent().removeClass("d-none");
		} else {
			$(this.puddle).parent().addClass("d-none");
		}
	}
	
	/**
	* Update the number of puddles
	*/
	updatePuddle(cases) {
		$(this.puddle).text(cases);
	}
	
	/**
	* Display or not the life element
	*
	* @param {boolean} displayed - Slime identifier
	*/
	displayLife(displayed) {
		if(displayed) {
			$(this.life).parent().removeClass("d-none");
		} else {
			$(this.life).parent().addClass("d-none");
		}
	}
	
	/**
	* Update the number of life
	*/
	updateLife(life) {
		$(this.life).text(life);
	}
	
	/**
	* Display or not the food element
	*
	* @param {boolean} displayed - Slime identifier
	*/
	displayFood(displayed) {
		if(displayed) {
			$(this.food).parent().removeClass("d-none");
		} else {
			$(this.food).parent().addClass("d-none");
		}
	}
	
	/**
	* Update the number of food
	*/
	updateFood(food) {
		$(this.food).text(food);
	}
	
	/**
	* Display or not the slime element
	*
	* @param {boolean} displayed - Slime identifier
	*/
	displaySlime(displayed) {
		if(displayed) {
			$(this.slime).removeClass("d-none");
		} else {
			$(this.slime).addClass("d-none");
		}
	}
	
	/**
	* Update the number of slime
	*/
	updateSlime(slime, power) {
		if(slime == Slime.Color.GREEN) {
			$(this.slime).children("img").attr("src","images/slimes/slime-green-right.png");
			$(this.slime).children("span").text("");
		} else if(slime == Slime.Color.BLUE) {
			$(this.slime).children("img").attr("src","images/slimes/slime-blue-right.png");
			$(this.slime).children("span").text("Utilisations restantes : " + power);
		} else if(slime == Slime.Color.RED) {
			$(this.slime).children("img").attr("src","images/slimes/slime-red-right.png");
			$(this.slime).children("span").text("Puissance de la ruée : " + (power + 1));
		} else if(slime == Slime.Color.YELLOW) {
			$(this.slime).children("img").attr("src","images/slimes/slime-yellow-right.png");
			$(this.slime).children("span").text("Nombre de tours restants : " + power);
		}
	}
	
	/**
	* Display or not the bubble element
	*
	* @param {boolean} displayed - Slime identifier
	*/
	displayBubble(displayed) {
		if(displayed) {
			$(this.bubble).removeClass("d-none");
		} else {
			$(this.bubble).addClass("d-none");
		}
	}
	
	/**
	* Update the number of bubble
	*/
	updateBubble(dialog) {
		$(this.bubble).children("span").html(dialog);
	}

}