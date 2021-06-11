/**
* @class Editor
*/
class Editor extends Play {
	
	/**
	* Constructor for editor class
	*
	* @param {Screen} screen - Screen element
	* @param {Tilemap} tilemap - Isometric tile map
	*/
	constructor(screen, tilemap) {
		super(screen, tilemap);
		this.selection = null;
		this.json = null;
	}
	
	/**
	* Start the game
	*/
	start() {
		this.ready = false;
		this.screen.menu(Screen.Display.TEST);
		this.loadJSON(this.json);
		this.tilemap.updateMapSize(this.data.tilesX, this.data.tilesY);
		this.tilemap.redrawTiles(this.tiles);
		this.screen.displayLevel(true);
		this.screen.updateLevel(0);
		this.init();
	}
	
	/**
	* Restart the game
	*/
	restart() {
		$('#modalEditor').modal('hide');
		this.ready = true;
		this.screen.updateStroke(0);
		this.reload();
	}
	
	/**
	* Update the game
	*/
	update() {
		this.screen.updateStroke(this.stroke);
	}
	
	/**
	* End the game
	*/
	end() {
		this.ready = false;
		if(this.stroke < this.data.stroke) {
			this.data.stroke = this.stroke;
			this.json.stroke = this.stroke;
		}
		let message = $("#editorAlert");
		message.removeClass("alert-danger");
		message.addClass("alert-success");
		message.empty();
		message.text("La carte a été réalisée avec succès. Votre meilleur score est de " + this.data.stroke + " coups.");
		$('#buttonAlert').removeClass("d-none");
		$("#download").attr("href", "data:text/json;charset=utf-8," + encodeURIComponent(stringify(this.json)));
		$('#modalEditor').modal('show');
	}
	
	/**
	* Redraw map, puddles and slimes
	*/
	redraw() {
		this.selection = null;
		if(this.screen.name == Screen.Display.EDITOR) {
			this.tilemap.updateMapSize(this.tiles.length, this.tiles[0].length);
			this.tilemap.redrawTiles(this.tiles, true);
			this.drawPowers();
			if(this.slime != null) {
				this.tilemap.drawSlime(this.slime);
			}
			if(this.enemy != null) {
				this.tilemap.drawSlime(this.enemy);
			}
			this.tilemap.drawGrid(this.tiles.length, this.tiles[0].length);
		} else {
			this.tilemap.updateMapSize(this.data.tilesX, this.data.tilesY);
			this.tilemap.redrawPuddles(this.puddles);
			this.tilemap.redrawTiles(this.tiles);
			this.tilemap.redrawSlimes(this.slime, this.enemy);
		}
	}
	
	/**
	* Get tile instance
	*
	* @param {string} name - Name of tile
	*/
	getTileInstance(name) {
		return Tile.instantiate(name, true);
	}
	
	/**
	*Configure the size map
	*
	* @param {int} tileX - X size
	* @param {int} tileY - Y size
	*/
	confugure(tilesX, tilesY) {
		let size = $("#grid").children("span");
		size.eq(0).text(tilesY);
		size.eq(1).text(tilesX);
		this.data.tilesX = tilesX;
		this.data.tilesY = tilesY;
	}
	
	/**
	* Initialize the map
	*
	* @param {boolean} complete - Complete initialize or not
	*/
	initialize(complete) {
		if(complete) {
			this.tiles = new Array();
			for(let x = 0; x < this.data.tilesX; x++) {
				this.tiles[x] = new Array();
				for(let y = 0; y < this.data.tilesY; y++) {
					this.tiles[x][y] = null;
				}
			}
			this.slime = null;
			this.enemy = null;
		} else {
			this.tileNumber();
			this.slime = new Slime(Slime.Color.GREEN, this.data.spawnX, this.data.spawnY, this.data.spawnD);
			if(this.data.enemy) {
				this.enemy = new Slime(Slime.Color.GRAY, this.data.enemyX, this.data.enemyY, this.data.enemyD);
			} else {
				this.enemy = null;
			}
			this.screen.updateLife(this.data.life);
			this.screen.updateFood(this.data.food);
			this.screen.updateSlime(Slime.Color.GREEN, 0);
			if(this.data.dialogs != null && this.data.dialogs.length > 0) {
				this.screen.updateBubble(this.data.dialogs[0]);
			} else {
				this.screen.updateBubble("Description de la carte");
			}
		}
		this.screen.menu(Screen.Display.EDITOR);
		this.screen.displayLife(true);
		this.screen.displayFood(true);
		this.screen.displayLevel(false);
		this.screen.displayPuddle(false);
		this.redraw();
	}
	
	/**
	* Draw power to the map
	*/
	drawPowers() {
		for(let x = 0; x < this.data.tilesX; x++) {
			for(let y = 0; y < this.data.tilesY; y++) {
				let tile = this.tiles[x][y];
				if(tile != null && tile.powerSupply != Tile.PowerSupply.NONE && tile.powers != null && tile.powers.length > 0) {
					let power = null;
					for(let i = 0; i < tile.powers.length; i++) {
						if(power != null) {
							power += " ";
						}
						power += tile.powers[i];
					}
					this.tilemap.drawNumber(x, y, power);
				}
			}
		}
	}
	
	/**
	* Create the selector list
	*
	* @param {string} id - Selector id
	*/
	createSelector(id) {
		let self = this;
		let list = $("#" + id).children("ul");
		this.screen.displayLoader(true);
		list.empty();
		let array = new Array();
		this.tilemap.loadAll(function() {
			for (const [key, value] of Object.entries(Tile.Name)) {
				let tile = self.getTileInstance(value);
				let orders = tile.groupOrder.split("-");
				let row = parseInt(orders[0]) - 1;
				let col = parseInt(orders[1]) - 1;
				if(array[row] == null) {
					array[row] = new Array();
				}
				array[row][col] = tile;
			}
			for(let x = 0; x < array.length; x++) {
				if(array[x] != null) {
					let element = $('<li><ul class="list-group list-group-horizontal list-style-none justify-content-end"></ul></li>');
					list.prepend(element);
					element = element.children("ul");
					for(let y = 0; y < array[x].length; y++) {
						let tile = array[x][y];
						if(tile != null) {
							element.prepend('<li><button name="' + tile.name + '" class="btn btn-default rounded-circle selector"><img src="' + self.tilemap.images.get(tile.name).src + '" /></button></li>');
						}
					}
				}
			}
			let element = $('<li><ul class="list-group list-group-horizontal list-style-none justify-content-end"></ul></li>');
			list.prepend(element);
			element = element.children("ul");
			element.append('<li><button name="enemy" class="btn btn-default rounded-circle selector"><img src="images/slimes/slime-gray-right.png" /></button></li>');
			element.append('<li><button name="slime" class="btn btn-default rounded-circle selector"><img src="images/slimes/slime-green-right.png" /></button></li>');
			element = $('<li><ul class="list-group list-group-horizontal list-style-none justify-content-end"></ul></li>');
			list.append(element);
			element = element.children("ul");
			element.append('<li><button name="eraser" class="btn btn-default rounded-circle selector"><img src="images/editor/eraser.png" /></button></li>');
			element.append('<li><button name="editor" class="btn btn-default rounded-circle selector"><img src="images/editor/editor.png" /></button></li>');
			element.append('<li><button name="cursor" class="btn btn-default rounded-circle selector"><img src="images/editor/cursor.png" /></button></li>');
			self.screen.displayLoader(false);
		});
	}
	
	/**
	* Hide all selector lines
	*
	* @param {string} id - Selector id
	*/
	hideLines(id) {
		$("#" + id).children("ul").children("li").children("ul").each(function() {
			$(this).children("li").not(":last").addClass("d-none");
		});
	}
	
	/**
	* Get tile on the cursor
	*
	* @param {event} event - Event
	*/
	getTileCursor(event) {
		let posX = event.pageX - this.tilemap.originX;
		let posY = event.pageY - this.tilemap.originY;
		let tileX = Math.round(posX / Tilemap.TILE_WIDTH / this.tilemap.ratio - posY / Tilemap.TILE_HEIGHT / this.tilemap.ratio);
		let tileY = Math.round(posX / Tilemap.TILE_WIDTH / this.tilemap.ratio + posY / Tilemap.TILE_HEIGHT / this.tilemap.ratio);
		if(tileX >= 0 && tileX < this.tiles.length && tileY >= 0 && tileY < this.tiles[0].length) {
			return {x: tileX, y: tileY};
		} else {
			return null;
		}
	}
	
	/**
	* Preview tile on the map
	*
	* @param {event} event - Event
	* @param {string} name - Tile name
	*/
	previewTile(event, name) {
		let pos = this.getTileCursor(event);
		if(pos != null) {
			if(name != null) {
				this.tilemap.drawImage(pos.x, pos.y, name);
			} else {
				this.tilemap.clearCanvas(2);
				this.tilemap.drawPuddle(pos.x, pos.y, "black");
			}
		} else {
			this.tilemap.clearCanvas(2);
		}
		if(this.selection != null && this.selection.pos != null) {
			this.tilemap.drawArea(this.selection.pos.x, this.selection.pos.y, this.selection.pos.x, this.selection.pos.y, "blue");
		}
	}
	
	/**
	* Create tile on the map
	*
	* @param {event} event - Event
	* @param {string} name - Tile name
	*/
	createTile(event, name) {
		let pos = this.getTileCursor(event);
		if(pos != null) {
			if(name != null) {
				this.tiles[pos.x][pos.y] = this.getTileInstance(name);
			} else {
				this.tiles[pos.x][pos.y] = null;
			}
			this.tilemap.redrawTiles(this.tiles, true);
			this.drawPowers();
		}
	}
	
	/**
	* Preview selection on the map
	*
	* @param {event} event - Event
	*/
	previewSelection(event) {
		let pos = this.getTileCursor(event);
		if(pos != null) {
			if(this.selection == null) {
				this.selection = pos;
				this.tilemap.clearCanvas(2);
				this.tilemap.drawArea(pos.x, pos.y, pos.x, pos.y, "blue");
			} else {
				this.tilemap.clearCanvas(2);
				this.tilemap.drawArea(this.selection.x, this.selection.y, pos.x, pos.y, "blue");
			}
		}
	}
	
	/**
	* Create tiles on the selection
	*
	* @param {event} event - Event
	* @param {string} name - Tile name
	*/
	createTileSelection(event, name) {
		let pos = this.getTileCursor(event);
		if(pos != null) {
			if(this.selection == null) {
				this.selection = pos;
			}
			let x1 = Math.min(this.selection.x, pos.x);
			let y1 = Math.min(this.selection.y, pos.y);
			let x2 = Math.max(this.selection.x, pos.x);
			let y2 = Math.max(this.selection.y, pos.y);
			for(let x = x1; x <= x2; x++) {
				for(let y = y1; y <= y2; y++) {
					if(name != null) {
						this.tiles[x][y] = this.getTileInstance(name);
					} else {
						this.tiles[x][y] = null;
					}
				}
			}
			this.tilemap.redrawTiles(this.tiles, true);
			this.drawPowers();
		}
		this.selection = null;
	}
	
	/**
	* Preview slime on the map
	*
	* @param {event} event - Event
	* @param {string} name - Slime type
	* @param {string} direction - Slime direction
	*/
	previewSlime(event, name, direction) {
		let pos = this.getTileCursor(event);
		if(pos != null) {
			if(this.selection == null) {
				this.selection = Play.Direction.RIGHT;
			}
			if(direction != null && direction != false) {
				if(this.selection == Play.Direction.RIGHT) {
					this.selection = Play.Direction.DOWN;
				} else if(this.selection == Play.Direction.DOWN) {
					this.selection = Play.Direction.LEFT;
				} else if(this.selection == Play.Direction.LEFT) {
					this.selection = Play.Direction.UP;
				} else if(this.selection == Play.Direction.UP) {
					this.selection = Play.Direction.RIGHT;
				}
			}
			if(name == "slime") {
				this.tilemap.drawImage(pos.x, pos.y, Slime.Color.GREEN + this.selection, true);
			} else if(name == "enemy") {
				this.tilemap.drawImage(pos.x, pos.y, Slime.Color.GRAY + this.selection, true);
			}
		} else {
			this.tilemap.clearCanvas(2);
		}
	}
	
	/**
	* Create slime on the map
	*
	* @param {event} event - Event
	* @param {string} name - Slime type
	*/
	createSlime(event, name) {
		let pos = this.getTileCursor(event);
		if(pos != null) {
			let tile = this.tiles[pos.x][pos.y];
			if(this.selection == null) {
				this.selection = Play.Direction.RIGHT;
			}
			if(name == "slime") {
				if(this.slime != null && this.slime.posX == pos.x && this.slime.posY == pos.y) {
					this.slime = null;
				} else if(tile != null && tile.spawnable == 2 && (this.enemy == null || this.enemy.posX != pos.x || this.enemy.posY != pos.y)) {
					this.slime = new Slime(Slime.Color.GREEN, pos.x, pos.y, this.selection);
				}
			} else if(name == "enemy") {
				if(this.enemy != null && this.enemy.posX == pos.x && this.enemy.posY == pos.y) {
					this.enemy = null;
				} else if(tile != null && tile.spawnable > 0 && (this.slime == null || this.slime.posX != pos.x || this.slime.posY != pos.y)) {
					this.enemy = new Slime(Slime.Color.GRAY, pos.x, pos.y, this.selection);
				}
			}
		}
		if(this.slime != null) {
			this.tilemap.drawSlime(this.slime);
		} else {
			this.tilemap.clearCanvas(3);
		}
		if(this.enemy != null) {
			this.tilemap.drawSlime(this.enemy);
		}
		this.tilemap.drawGrid(this.tiles.length, this.tiles[0].length);
	}
	
	/**
	* Copy tile
	*
	* @param {event} event - Event
	*/
	copyTile(event) {
		let pos = this.getTileCursor(event);
		this.tilemap.clearCanvas(2);
		if(pos != null && this.tiles[pos.x][pos.y] != null && (this.selection == null || this.selection.pos.x != pos.x || this.selection.pos.y != pos.y)) {
			this.selection = {pos : pos, tile : this.tiles[pos.x][pos.y]};
			this.tilemap.drawArea(pos.x, pos.y, pos.x, pos.y, "blue");
		} else {
			this.selection = null;
			this.tilemap.clearCanvas(2);
		}
	}
	
	/**
	* Parse tile
	*
	* @param {event} event - Event
	*/
	pasteTile(event) {
		let pos = this.getTileCursor(event);
		if(pos != null && this.selection != null) {
			this.tiles[pos.x][pos.y] = JSON.parse(JSON.stringify(this.selection.tile));
			this.tilemap.redrawTiles(this.tiles, true);
			this.drawPowers();
		}
	}
	
	/**
	* Edit power tile
	*
	* @param {event} event - Event
	* @param {string} reverse - Increase or decrease
	*/
	editTile(event, reverse) {
		let pos = this.getTileCursor(event);
		let selection = this.selection;
		if(pos != null && this.tiles[pos.x][pos.y] != null) {
			let tile = this.tiles[pos.x][pos.y];
			if(this.selection != null && (this.selection.tile.relation != tile.name || this.selection.tile == tile)) {
				this.selection = null;
				this.tilemap.clearCanvas(2);
			}
			if(tile.relation == null && this.selection == null) {
				if(tile.powerSupply == Tile.PowerSupply.BOOLEAN) {
					this.increasePower(tile, 0, 1, reverse);
				} else if(tile.powerSupply == Tile.PowerSupply.INTEGER) {
					this.increasePower(tile, 0, 99, reverse);
				}
			} else if(this.selection != null) {
				if(this.selection.tile.powerSupply == Tile.PowerSupply.INTEGER) {
					this.addPower(tile, pos, false);
				} else if(this.selection.tile.powerSupply == Tile.PowerSupply.LIST) {
					this.addPower(tile, pos, true);
				}
			} else if(selection == null || selection != tile) {
				this.selection = {pos : pos, tile : tile};
				this.tilemap.drawArea(pos.x, pos.y, pos.x, pos.y, "blue");
			}
		} else if(this.selection != null) {
			this.selection = null;
			this.tilemap.clearCanvas(2);
		}
	}
	
	/**
	* Increase or decrease the power
	*
	* @param {Tile} tile - Target tile
	* @param {int} min - Minimum power
	* @param {int} max - Maximum power
	* @param {string} reverse - Increase or decrease
	*/
	increasePower(tile, min, max, decrease) {
		let power;
		if(tile.powers == null) {
			tile.powers = new Array();
		}
		if(tile.powers.length == 0) {
			power = 0;
		} else {
			power = tile.powers[0];
		}
		if(!decrease) {
			if(power + 1 <= max) {
				power++;
			} else {
				power = min;
			}
		} else {
			if(power - 1 >= min) {
				power--;
			} else {
				power = max;
			}
		}
		tile.powers[0] = power;
		this.tilemap.redrawTiles(this.tiles, true);
		this.drawPowers();
	}
	
	/**
	* Add a power coordinate
	*
	* @param {Tile} target - Target tile
	* @param {object} pos - Position of the tile
	* @param {boolean} list - If can have multiple power
	*/
	addPower(target, pos, list) {
		let tile = this.selection.tile;
		if(tile.powers == null) {
			tile.powers = new Array();
		}
		let power = pos.x * this.data.tilesY + pos.y + 1;
		if(tile.name == tile.relation) {
			let pow = this.selection.pos.x * this.data.tilesY + this.selection.pos.y + 1;
			if(target.powers == null || target.powers.length == 0) {
				target.powers = new Array();
				target.powers[0] = pow;
			} else if(tile.powers.length > 0 && target.powers[0] == pow) {
				target.powers = new Array();
			}
		}
		if(!list) {
			if(tile.powers.length == 0 || tile.powers[0] != power) {
				tile.powers[0] = power;
			} else {
				tile.powers = new Array();
			}
		} else {
			let index = tile.powers.indexOf(power);
			if(index == -1) {
				tile.powers.push(power);
			} else {
				tile.powers.splice(index, 1);
			}
		}
		this.tilemap.redrawTiles(this.tiles, true);
		this.drawPowers();
		this.selection = null;
		this.tilemap.clearCanvas(2);
	}
	
	/**
	* Check if the map don't have errors
	*/
	checkCompliance() {
		let errors = new Array();
		this.json = {};
		if(this.slime != null) {
			let tile = this.tiles[this.slime.posX][this.slime.posY];
			if(tile != null && tile.spawnable == 2) {
				this.json.spawn = new Object();
				this.json.spawn.x = this.slime.posY + 1; // Case start at index 1 in the json and x axis is the top left border
				this.json.spawn.y = this.slime.posX + 1; // Case start at index 1 in the json and x axis is the top left border
				this.json.spawn.direction = this.slime.direction;
			} else {
				errors.push("Votre slime ne peut pas apparaître sur la case actuelle");
			}
		} else {
			errors.push("Vous devez définir un spawn");
		}
		if(this.screen.valueLife() > 0) {
			this.json.life = this.screen.valueLife();
		}
		if(this.screen.valueFood() > 0) {
			this.json.food = this.screen.valueFood();
		}
		if(this.enemy != null) {
			let tile = this.tiles[this.enemy.posX][this.enemy.posY];
			if(tile != null && tile.spawnable > 0) {
				this.json.enemy = new Object();
				this.json.enemy.x = this.enemy.posY + 1; // Case start at index 1 in the json and x axis is the top left border
				this.json.enemy.y = this.enemy.posX + 1; // Case start at index 1 in the json and x axis is the top left border
				this.json.enemy.direction = this.enemy.direction;
			} else {
				errors.push("Le slime ennemi ne peut pas apparaître sur la case actuelle");
			}
		}
		this.json.stroke = 999;
		if(this.screen.valueBubble().length > 0) {
			this.json.dialogs = [this.screen.valueBubble()];
		}
		if(errors.length == 0) {
			this.tilesAdjust();
			this.start();
		} else {
			let message = $("#editorAlert");
			message.addClass("alert-danger");
			message.removeClass("alert-success");
			message.empty();
			message.html("Votre carte contient des erreurs, veuillez les corriger afin de pouvoir tester la map :<ul>");
			for(let i = 0; i < errors.length; i++) {
				message.append("<li> " + errors[i] + "</li>");
			}
			message.append("</ul>");
			$('#buttonAlert').addClass("d-none");
			$('#modalEditor').modal('show');
		}
	}
	
	/**
	* Create the id and index power then json tiles and json map
	*/
	tilesAdjust() {
		let counter = new Map();
		let tiles = new Array();
		let strMap = new Array();
		let idxMap = new Array();
		// Add identifier
		for(let x = 0; x < this.data.tilesX; x++) {
			for(let y = 0; y < this.data.tilesY; y++) {
				let tile = this.tiles[x][y];
				if(tile != null && tile.identifiable) {
					if(counter.has(tile.name)) {
						let id = counter.get(tile.name);
						id++;
						counter.set(tile.name, id);
						tile.id = id;
					} else {
						counter.set(tile.name, 1);
						tile.id = 1;
					}
				}
			}
		}
		// Transform coordinates into index and add to map
		for(let x = 0; x < this.data.tilesX; x++) {
			strMap[x] = new Array();
			for(let y = 0; y < this.data.tilesY; y++) {
				let tile = this.tiles[x][y];
				if(tile != null) {
					let powers = new Array();
					if(tile.relation != null) {
						if(tile.powers != null && tile.powers != "") {
							for(let i = 0; i < tile.powers.length; i++) {
								let power = parseInt(tile.powers[i] - 1); // Tile start to index 1
								let posX = Math.trunc(power / this.data.tilesY);
								let posY = power % this.data.tilesY;
								let rel = this.tiles[posX][posY];
								if(rel != null && rel.name == tile.relation && rel.id != null) {
									powers.push(rel.id);
								}
							}
							
						}
					} else if(tile.powerSupply != Tile.PowerSupply.NONE) {
						if(tile.powers != null && tile.powers != "") {
							powers.push(parseInt(tile.powers));
						}
					}
					tile.powers = powers;
					let str = tile.name;
					if(tile.id != null) {
						str += ":" + tile.id;
					}
					if(tile.powers.length > 0) {
						str += ":";
						str += tile.powers.join(':');
					}
					if(!tiles.includes(str)) {
						tiles.push(str);
					}
					strMap[x][y] = str;
				}
			}
		}
		tiles.sort();
		// Create map index
		for(let x = 0; x < this.data.tilesX; x++) {
			idxMap[x] = new Array();
			for(let y = 0; y < this.data.tilesY; y++) {
				if(strMap[this.data.tilesX - 1 - x][y] == null) { // Reverse the X abscissa array for corresponding to the json map
					idxMap[x][y] = 0;
				} else {
					idxMap[x][y] = tiles.indexOf(strMap[this.data.tilesX - 1 - x][y]) + 1;
				}
			}
		}
		this.json.tiles = tiles;
		this.json.map = idxMap;
	}
	
	/**
	* Transform the index power to coordinate power
	*/
	tileNumber() {
		let tiles = new Array();
		for(let x = 0; x < this.data.tilesX; x++) {
			for(let y = 0; y < this.data.tilesY; y++) {
				let tile = this.tiles[x][y];
				if(tile != null && tile.relation != null && tile.powers != null) {
					for(let i = 0; i < this.data.tilesX; i++) {
						for(let j = 0; j < this.data.tilesY; j++) {
							let rel = this.tiles[i][j];
							if(rel != null && rel.name == tile.relation && rel.id != null && tile.powers.includes(rel.id)) {
								let index = tile.powers.indexOf(rel.id);
								let num = i * this.data.tilesY + j + 1; // Tile start to index 1
								tiles.push({x: x, y: y, i: index, p: num});
							}
						}
					}
				}
			}
		}
		for(let i = 0; i < tiles.length; i++) {
			let tile = tiles[i];
			this.tiles[tile.x][tile.y].powers[tile.i] = tile.p;
		}
	}

}