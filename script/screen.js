/**
* @class Screen
*/
class Screen {
	
	constructor(idLevel, idPuddle, idLife, idFood, idSlime, idBubble) {
		this.level = document.getElementById(idLevel);
		this.puddle = document.getElementById(idPuddle);
		this.life = document.getElementById(idLife);
		this.food = document.getElementById(idFood);
		this.slime = document.getElementById(idSlime);
		this.bubble = document.getElementById(idBubble);
	}
	
	displayLevel(displayed) {
		if(displayed) {
			$(this.level).parent().removeClass("d-none");
		} else {
			$(this.level).parent().addClass("d-none");
		}
	}
	
	updateLevel(level) {
		$(this.level).text(level);
	}
	
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
	
	displayLife(displayed) {
		if(displayed) {
			$(this.life).parent().removeClass("d-none");
		} else {
			$(this.life).parent().addClass("d-none");
		}
	}
	
	updateLife(life) {
		$(this.life).text(life);
	}
	
	displayFood(displayed) {
		if(displayed) {
			$(this.food).parent().removeClass("d-none");
		} else {
			$(this.food).parent().addClass("d-none");
		}
	}
	
	updateFood(food) {
		$(this.food).text(food);
	}
	
	displaySlime(displayed) {
		if(displayed) {
			$(this.slime).removeClass("d-none");
		} else {
			$(this.slime).addClass("d-none");
		}
	}
	
	updateSlime(slime, power) {
		if(slime == Slime.Color.GREEN) {
			$(this.slime).children("img").attr("src","images/characters/slime-green-right.png");
			$(this.slime).children("span").text("");
		} else if(slime == Slime.Color.BLUE) {
			$(this.slime).children("img").attr("src","images/characters/slime-blue-right.png");
			$(this.slime).children("span").text("Utilisations restantes : " + power);
		} else if(slime == Slime.Color.RED) {
			$(this.slime).children("img").attr("src","images/characters/slime-red-right.png");
			$(this.slime).children("span").text("Puissance de la ruée : " + (power + 1));
		} else if(slime == Slime.Color.YELLOW) {
			$(this.slime).children("img").attr("src","images/characters/slime-yellow-right.png");
			$(this.slime).children("span").text("Nombre de tours restants : " + power);
		}
	}
	
	displayBubble(displayed) {
		if(displayed) {
			$(this.bubble).removeClass("d-none");
		} else {
			$(this.bubble).addClass("d-none");
		}
	}
	
	updateBubble(dialog) {
		$(this.bubble).children("span").html(dialog);
	}

}