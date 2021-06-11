/**
* @class Screen
*/
class Screen {
	
	/**
	* @enum Puddles constants
	*/
	static get Display() {
		return {
			MENU: "menu",
			GAME: "game",
			EDITOR: "editor",
			TEST: "test"
		};
	}
	
	/**
	* Constructor for screen class
	*/
	constructor() {
		this.name = Screen.Display.MENU;
		
		this.level = document.getElementById("level");
		this.stroke = document.getElementById("stroke");
		this.puddle = document.getElementById("puddle");
		this.life = document.getElementById("life");
		this.food = document.getElementById("food");
		this.slime = document.getElementById("slime");
		this.bubble = document.getElementById("bubble");
		this.loader = document.getElementById("loader");
	}
	
	/**
	* Display or not the level element
	*
	* @param {boolean} displayed - If the element must be display
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
	*
	* @param {int} level - Level of the game
	*/
	updateLevel(level) {
		$(this.level).text(level);
	}
	
	/**
	* Update stroke for the star
	*
	* @param {int} stroke - Number of stroke
	*/
	updateStroke(stroke) {
		$(this.stroke).text(stroke);
	}
	
	/**
	* Display or not the puddle element
	*
	* @param {boolean} displayed - If the element must be display
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
	*
	* @param {int} cases - Cases remaining
	*/
	updatePuddle(cases) {
		$(this.puddle).text(cases);
	}
	
	/**
	* Display or not the life element
	*
	* @param {boolean} displayed - If the element must be display
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
	*
	* @param {int} life - Life remaining
	*/
	updateLife(life) {
		$(this.life).text(life);
	}
	
	/**
	* Content editable for the life
	*
	* @param {boolean} editable - Life editable
	*/
	editableLife(editable) {
		if(editable) {
			$(this.life).attr("contenteditable", true);
			$(this.life).attr("min", 0);
			$(this.life).attr("max", 99);
		} else {
			$(this.life).attr("contenteditable", false);
			$(this.life).removeAttr("min");
			$(this.life).removeAttr("max");
		}
	}
	
	/**
	* Get the life value
	*/
	valueLife() {
		return parseInt($(this.life).text());
	}
	
	/**
	* Display or not the food element
	*
	* @param {boolean} displayed - If the element must be display
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
	*
	* @param {int} food - Food remaining
	*/
	updateFood(food) {
		$(this.food).text(food);
	}
	
	/**
	* Content editable for the food
	*
	* @param {boolean} editable - Food editable
	*/
	editableFood(editable) {
		if(editable) {
			$(this.food).attr("contenteditable", true);
			$(this.food).attr("min", 0);
			$(this.food).attr("max", 99);
		} else {
			$(this.food).attr("contenteditable", false);
			$(this.food).removeAttr("min");
			$(this.food).removeAttr("max");
		}
	}
	
	/**
	* Get the food value
	*/
	valueFood() {
		return parseInt($(this.food).text());
	}
	
	/**
	* Display or not the slime element
	*
	* @param {boolean} displayed - If the element must be display
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
	*
	* @param {string} color - Color slime for icon
	* @param {int} power - Power of slime
	*/
	updateSlime(color, power) {
		if(color == Slime.Color.GREEN) {
			$(this.slime).children("img").attr("src","images/slimes/slime-green-right.png");
			$(this.slime).children("span").text("");
		} else if(color == Slime.Color.BLUE) {
			$(this.slime).children("img").attr("src","images/slimes/slime-blue-right.png");
			$(this.slime).children("span").text("Utilisations restantes : " + power);
		} else if(color == Slime.Color.RED) {
			$(this.slime).children("img").attr("src","images/slimes/slime-red-right.png");
			$(this.slime).children("span").text("Puissance de la ruée : " + (power + 1));
		} else if(color == Slime.Color.YELLOW) {
			$(this.slime).children("img").attr("src","images/slimes/slime-yellow-right.png");
			$(this.slime).children("span").text("Nombre de tours restants : " + power);
		} else if(color == Slime.Color.PURPLE) {
			$(this.slime).children("img").attr("src","images/slimes/slime-purple-right.png");
			$(this.slime).children("span").text("Portée du lancer : " + power);
		} else if(color == Slime.Color.ORANGE) {
			$(this.slime).children("img").attr("src","images/slimes/slime-orange-right.png");
			$(this.slime).children("span").text("Téléportations restantes : " + power);
		}
	}
	
	/**
	* Display or not the bubble element
	*
	* @param {boolean} displayed - If the element must be display
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
	*
	* @param {string} dialog - Dialog to show
	*/
	updateBubble(dialog) {
		$(this.bubble).children("span").html(dialog);
	}
	
	/**
	* Content editable for the food
	*
	* @param {boolean} editable - Food editable
	*/
	editableBubble(editable) {
		if(editable) {
			$(this.bubble).children("span").attr("contenteditable", true);
		} else {
			$(this.bubble).children("span").attr("contenteditable", false);
		}
	}
	
	/**
	* Get the food value
	*/
	valueBubble() {
		return $(this.bubble).children("span").text().trim();
	}
	
	/**
	* Display or not the loader element
	*
	* @param {boolean} displayed - If the element must be display
	*/
	displayLoader(displayed) {
		if(displayed) {
			$(this.loader).removeClass("d-none");
		} else {
			$(this.loader).addClass("d-none");
		}
	}
	
	/**
	* Display the menu
	*
	* @param {string} name - Menu name
	*/
	menu(name) {
		this.name = name;
		if(name == Screen.Display.MENU) {
			$("#editor").removeClass("d-none");
			$("#play").addClass("d-none");
			$("#stop").addClass("d-none");
			$("#restart").addClass("d-none");
			$("#selector, #grid").addClass("d-none");
			$("#command").addClass("d-none");
			this.editableLife(false);
			this.editableFood(false);
			this.editableBubble(false);
		} else if(name == Screen.Display.GAME) {
			$("#editor").addClass("d-none");
			$("#play").addClass("d-none");
			$("#stop").addClass("d-none");
			$("#restart").removeClass("d-none");
			$("#selector, #grid").addClass("d-none");
			$("#command").removeClass("d-none");
			this.editableLife(false);
			this.editableFood(false);
			this.editableBubble(false);
		} else if(name == Screen.Display.EDITOR) {
			$("#editor").addClass("d-none");
			$("#play").removeClass("d-none");
			$("#stop").addClass("d-none");
			$("#restart").addClass("d-none");
			$("#selector, #grid").removeClass("d-none");
			$("#command").addClass("d-none");
			this.editableLife(true);
			this.editableFood(true);
			this.editableBubble(true);
			this.displayBubble(true);
		} else if(name == Screen.Display.TEST) {
			$("#editor").addClass("d-none");
			$("#play").addClass("d-none");
			$("#stop").removeClass("d-none");
			$("#restart").addClass("d-none");
			$("#selector, #grid").addClass("d-none");
			$("#command").removeClass("d-none");
			this.editableLife(false);
			this.editableFood(false);
			this.editableBubble(false);
		}
	}

}