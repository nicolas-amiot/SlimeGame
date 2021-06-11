/**
* @class Tilemap renderer
*/
class Tilemap {
	
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
	static get SLIME_WIDTH() {
		return 120;
	}

	/**
	* @enum Character height constants
	*/
	static get SLIME_HEIGHT() {
		return 80;
	}
	
	/**
	* Constructor for tilemap
	*
	* @param {string} layer1 - layer used to create map render
	* @param {string} layer2 - layer used to show slime puddles
	* @param {string} layer3 - layer used to display the slime
	*/
	constructor(layer1, layer2, layer3) {
		// Context
		this.mapCtx = document.getElementById(layer1).getContext("2d"); // Map canvas
		this.tileCtx = document.getElementById(layer2).getContext("2d"); // Puddles canvas
		this.charCtx = document.getElementById(layer3).getContext("2d"); // Character canvas
		
		// Origin and ratio
		this.ratio = 1; // Ratio image size
		this.originX = 0; // Origin x to display the map
		this.originY = 0; // Origin y to display the map
		
		// Images
		this.images = new Map();
	}
	
	/**
	* Load background
	*/
	loadBackground() {
		let self = this;
		if(this.images.has("background")) {
			let image = this.images.get("background");
			this.drawLandscape(image);
		} else {
			let image = new Image();
			image.src = "images/background.jpg";
			// Make sure the image is loaded
			image.onload = function(){
				self.images.set("background", image);
				self.drawLandscape(image);
			}
		}
	}
	
	/**
	* Draw landscape background
	*/
	drawLandscape(image) {
		let width = $(window).width();
		let height = $(window).height();
		this.mapCtx.canvas.width = width;
		this.mapCtx.canvas.height = height;
		this.mapCtx.globalAlpha = 0.5;
		let ratioImage = image.width / image.height;
		let ratioWindow = width / height;
		if(ratioWindow >= ratioImage) {
			let margin = width / ratioImage - height;
			if(margin > image.height / 1.5) { // Keep 25% image
				margin = image.height / 1.5;
			}
			this.mapCtx.drawImage(image, 0, margin / 2, image.width, image.height - margin, 0, 0, width, height);
		} else {
			let margin = height * ratioImage - width;
			if(margin > image.width / 1.5) { // Keep 25% image
				margin = image.width / 1.5;
			}
			this.mapCtx.drawImage(image, margin / 2, 0, image.width - margin, image.height, 0, 0, width, height);
		}
	}
	
	/**
	* Load all game images
	*
	* @param {function} callback - Function to execute after loading
	*/
	loadAll(callback) {
		let tiles = new Array();
		tiles[0] = new Array();
		for (const [key, value] of Object.entries(Tile.Name)) {
			let tile = Tile.instantiate(value, false);
			if(tile.path == null) {
				tile.path = tile.editorPath;
			}
			tiles[0].push(tile);
		}
		this.loadMap(tiles, true, callback);
	}
	
	/**
	* Load the game images
	*
	* @param {array} tiles - Tiles map
	* @param {boolean} enemy - If enemy is present
	* @param {function} callback - Function to execute after loading
	*/
	loadMap(tiles, enemy, callback) {
		let self = this;
		let mapImg = new Map();
		let loadedImages = 0;
		let colors = Object.values(Slime.Color);
		this.putSlimeImage(mapImg, Slime.Color.GREEN);
		if(enemy) {
			this.putSlimeImage(mapImg, Slime.Color.GRAY);
		}
		for(let x = 0; x < tiles.length; x++) {
			for(let y = 0; y < tiles[x].length; y++) {
				let tile = tiles[x][y];
				if(tile != null && tile.path != null && !this.images.has(tile.name)) {
					mapImg.set(tile.name, tile.path);
					if (colors.indexOf(tile.name) > -1) {
						this.putSlimeImage(mapImg, tile.name);
					}
				}
			}
		}
		if(mapImg.size > 0) {
			for (const [key, value] of mapImg.entries()) {
				let image = new Image();
				image.onload = function() {
					if(++loadedImages >= mapImg.size) { // All images have been loaded
						callback();
					}
				}
				self.images.set(key, image);
				image.src = value; // After onload for cache
			}
		} else {
			callback();
		}
	}
	
	/**
	* Update map size and center map
	*
	* @param {int} tilesY - Number of X tiles
	* @param {int} tilesY - Number of Y tiles
	*/
	updateMapSize(tilesX, tilesY) {
		let width = $(window).width();
		let height = $(window).height();
		let maxWidth = (tilesX + tilesY) / 2 * Tilemap.TILE_WIDTH;
		let maxHeight = (tilesX + tilesY) / 2 * Tilemap.TILE_HEIGHT + Tilemap.TILE_DEPTH;
		if(width >= maxWidth && height >= maxHeight) {
			this.ratio = 1;
		} else if(width >= maxWidth * 0.75 && height >= maxHeight * 0.75) {
			this.ratio = 0.75;
		} else if(width >= maxWidth * 0.5 && height >= maxHeight * 0.5) {
			this.ratio = 0.5;
		} else {
			this.ratio = 0.25;
		}

		// Canvas take all screen 
		this.mapCtx.canvas.width = width;
		this.mapCtx.canvas.height = height;
		this.tileCtx.canvas.width = width;
		this.tileCtx.canvas.height = height;
		this.charCtx.canvas.width = width;
		this.charCtx.canvas.height = height;

		// Center map
		var totalWidth = (tilesX + tilesY) / 2 - 1;
		var totalHeight = (tilesY - tilesX) / 2;
		this.originX = (width - totalWidth * Tilemap.TILE_WIDTH * this.ratio) / 2;
		this.originY = (height - totalHeight * Tilemap.TILE_HEIGHT * this.ratio - Tilemap.TILE_DEPTH * this.ratio) / 2;
	}
	
	/**
	* Redraw all slimes
	*
	* @param {Slime} slime - Slime to draw
	* @param {Slime} enemySlime - Enemy slime to draw
	*/
	redrawSlimes(slime, enemySlime) {
		this.drawSlime(slime);
		if(enemySlime != null) {
			this.drawSlime(enemySlime);
		}
	}
	
	/**
	* Draw the slime character
	*
	* @param {Slime} slime - Slime to draw
	* @param {int} vw - Image width
	* @param {int} vh - Image height
	*/
	drawSlime(slime, vw, vh) {
		if(vw == null) {
			vw = 0;
		}
		if(vh == null) {
			vh = 0;
		}
		let w = (Tilemap.SLIME_WIDTH + vw) * this.ratio;
		let h = (Tilemap.SLIME_HEIGHT + vh) * this.ratio;
		let offX = (slime.posX - 1) * Tilemap.TILE_WIDTH * this.ratio / 2 + slime.posY * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
		let offY = (slime.posY - 1) * Tilemap.TILE_HEIGHT * this.ratio / 2 - slime.posX * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
		offX = offX + Tilemap.TILE_WIDTH * this.ratio * 0.25 - (w - Tilemap.TILE_HEIGHT * this.ratio) / 2;
		offY = offY - Tilemap.TILE_HEIGHT * this.ratio * 0.25 - (h - Tilemap.TILE_HEIGHT * this.ratio);
		if(slime.color != Slime.Color.GRAY) {
			this.clearCanvas(3);
		}
		this.charCtx.drawImage(this.images.get(slime.color + slime.direction), offX, offY, w, h);
	}
	
	/**
	* Redraw map
	*
	* @param {array} tiles - Tiles array map
	* @param {boolean} all - If load image tile editor
	*/
	redrawTiles(tiles, all) {
		// Clear canvas
		this.clearCanvas(1);

		// Draw tiles with display priority 
		for(let x = tiles.length - 1; x >= 0; x--) {
			for(let y = 0; y < tiles[x].length; y++) {
				let tile = tiles[x][y];
				this.drawTile(x, y, tile, all);
			}
		}
	}
	
	/**
	* Draw tile
	*
	* @param {int} x - X position
	* @param {int} y - Y position
	* @param {Tile} tiles - tile to draw
	* @param {boolean} all - If load image tile editor
	*/
	drawTile(x, y, tile, all) {
		if(tile != null) {
			let image = this.images.get(tile.name);
			if(image != null && (tile.path != null || all == true)) {
				let offX = (x - 1) * Tilemap.TILE_WIDTH * this.ratio / 2 + y * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
				let offY = (y - 1) * Tilemap.TILE_HEIGHT * this.ratio / 2 - x * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
				let ratioImage = Tilemap.TILE_WIDTH * this.ratio / image.width;
				this.mapCtx.drawImage(image, offX, offY, image.width * ratioImage, image.height * ratioImage);
			}
		}
	}
	
	/**
	* Redraw puddles
	*
	* @param {array} puddles - Puddles array map
	*/
	redrawPuddles(puddles) {
		// Clear canvas
		this.clearCanvas(2);

		// Draw tiles with display priority
		for(let x = 0; x < puddles.length; x++) {
			for(let y = 0; y < puddles[x].length; y++) {
				let puddle = puddles[x][y];
				if(puddle != Play.Puddle.NONE && puddle != Play.Puddle.NULL) {
					this.drawPuddle(x, y, puddle);
				}
			}
		}
	}
	
	/**
	* Draw or clear the puddle
	*
	* @param {int} x - Position X of tile
	* @param {int} y - Position Y of tile
	* @param {string} color - Color puddle or null for clear
	*/
	drawPuddle(x, y, color) {
		let border; // Remomve border line
		if(color != null) {
			this.tileCtx.globalCompositeOperation='source-over';
			this.tileCtx.globalAlpha = 0.5;
			this.tileCtx.strokeStyle = color;
			this.tileCtx.fillStyle = color;
			this.tileCtx.lineWidth = 1;
			border = 0;
		} else { // If the color is null then the area is clear
			this.tileCtx.globalCompositeOperation='destination-out';
			this.tileCtx.globalAlpha = 1;
			border = 1;
		}
		let offX = x * Tilemap.TILE_WIDTH * this.ratio / 2 + y * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
		let offY = y * Tilemap.TILE_HEIGHT * this.ratio / 2 - x * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
		let top = offY + Tilemap.TILE_HEIGHT * this.ratio / 2 + border / 2;
		let bot = offY - Tilemap.TILE_HEIGHT * this.ratio / 2 - border / 2;
		let right = offX + Tilemap.TILE_WIDTH * this.ratio / 2 + border;
		let left = offX - Tilemap.TILE_WIDTH * this.ratio / 2 - border;

		
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
	* Draw grid
	*
	* @param {int} caseX - Number of x case
	* @param {int} caseY - Number of y case
	*/
	drawGrid(caseX, caseY) {
		this.charCtx.globalCompositeOperation='source-over';
		this.charCtx.globalAlpha = 1;
		this.charCtx.strokeStyle = "gray";
		this.charCtx.lineWidth = 1;
		for(let x = 0; x <= caseX; x++) {
			let startX = (x - 1) * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
			let startY = -x * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
			let endX = startX + caseY * Tilemap.TILE_WIDTH * this.ratio / 2;
			let endY = startY + caseY * Tilemap.TILE_HEIGHT * this.ratio / 2;
			this.charCtx.beginPath();
			this.charCtx.moveTo(startX, startY);
			this.charCtx.lineTo(endX, endY);
			this.charCtx.closePath();
			this.charCtx.stroke();
		}
		for(let y = 0; y <= caseY; y++) {
			let startX = (y - 1) * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
			let startY = y * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
			let endX = startX + caseX * Tilemap.TILE_WIDTH * this.ratio / 2;
			let endY = startY - caseX * Tilemap.TILE_HEIGHT * this.ratio / 2;
			this.charCtx.beginPath();
			this.charCtx.moveTo(startX, startY);
			this.charCtx.lineTo(endX, endY);
			this.charCtx.closePath();
			this.charCtx.stroke();
		}
	}
	
	/**
	* Draw tile
	*
	* @param {int} x - X position
	* @param {int} y - Y position
	* @param {string} name - Image name to draw
	* @param {string} slime - If image to draw is a slime
	*/
	drawImage(x, y, name, slime) {
		this.clearCanvas(2);
		this.tileCtx.globalCompositeOperation='source-over';
		this.tileCtx.globalAlpha = 0.5;
		let image = this.images.get(name);
		if(image != null) {
			if(slime == null || slime == false) {
				let offX = (x - 1) * Tilemap.TILE_WIDTH * this.ratio / 2 + y * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
				let offY = (y - 1) * Tilemap.TILE_HEIGHT * this.ratio / 2 - x * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
				let ratioImage = Tilemap.TILE_WIDTH * this.ratio / image.width;
				this.tileCtx.drawImage(image, offX, offY, image.width * ratioImage, image.height * ratioImage);
			} else {
				let w = Tilemap.SLIME_WIDTH * this.ratio;
				let h = Tilemap.SLIME_HEIGHT * this.ratio;
				let offX = (x - 1) * Tilemap.TILE_WIDTH * this.ratio / 2 + y * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
				let offY = (y - 1) * Tilemap.TILE_HEIGHT * this.ratio / 2 - x * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
				offX = offX + Tilemap.TILE_WIDTH * this.ratio * 0.25 - (w - Tilemap.TILE_HEIGHT * this.ratio) / 2;
				offY = offY - Tilemap.TILE_HEIGHT * this.ratio * 0.25 - (h - Tilemap.TILE_HEIGHT * this.ratio);
				this.tileCtx.drawImage(image, offX, offY, w, h);
			}
		}
	}
	
	/**
	* Draw a number
	*
	* @param {int} x - X position
	* @param {int} y - Y position
	* @param {int} number - Number to draw
	*/
	drawNumber(x, y, number) {
		number = number.toString();
		let font = 20 * this.ratio;
		this.mapCtx.globalCompositeOperation= 'source-over';
		this.mapCtx.globalAlpha = 1;
		this.mapCtx.fillStyle = 'black';
		this.mapCtx.font = 'bold ' + font + 'px Courier';
		let offX = x * Tilemap.TILE_WIDTH * this.ratio / 2 + y * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX - 6.2 * number.length * this.ratio;
		let offY = y * Tilemap.TILE_HEIGHT * this.ratio / 2 - x * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY + 5.5 * this.ratio;
		this.mapCtx.fillText(number, offX, offY);
	}
	
	
	/**
	* Draw a selection area
	*
	* @param {int} x1 - X position to the first tile
	* @param {int} y1 - Y position to the first tile
	* @param {int} x2 - X position to the last tile
	* @param {int} y2 - Y position to the last tile
	* @param {string} color - Number to draw
	*/
	drawArea(x1, y1, x2, y2, color) {
		this.tileCtx.globalCompositeOperation='source-over';
		this.tileCtx.globalAlpha = 1;
		this.tileCtx.strokeStyle = color;
		this.tileCtx.lineWidth = 2;
		if(x1 > x2) {
			let xt = x1;
			x1 = x2;
			x2 = xt;
		}
		if(y1 > y2) {
			let yt = y1;
			y1 = y2;
			y2 = yt;
		}
		let leftX = (x1 - 1) * Tilemap.TILE_WIDTH * this.ratio / 2 + y1 * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
		let leftY = y1 * Tilemap.TILE_HEIGHT * this.ratio / 2 - x1 * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
		let topX = x1 * Tilemap.TILE_WIDTH * this.ratio / 2 + y2 * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
		let topY = (y2 + 1) * Tilemap.TILE_HEIGHT * this.ratio / 2 - x1 * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
		let rightX = (x2 + 1) * Tilemap.TILE_WIDTH * this.ratio / 2 + y2 * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
		let rightY = y2 * Tilemap.TILE_HEIGHT * this.ratio / 2 - x2 * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
		let botX = x2 * Tilemap.TILE_WIDTH * this.ratio / 2 + y1 * Tilemap.TILE_WIDTH * this.ratio / 2 + this.originX;
		let botY = (y1 - 1) * Tilemap.TILE_HEIGHT * this.ratio / 2 - x2 * Tilemap.TILE_HEIGHT * this.ratio / 2 + this.originY;
		
		this.tileCtx.beginPath();
		this.tileCtx.moveTo(leftX, leftY);
		this.tileCtx.lineTo(topX, topY);
		this.tileCtx.lineTo(rightX, rightY);
		this.tileCtx.lineTo(botX, botY);
		this.tileCtx.closePath();
		this.tileCtx.stroke();
	}
	
	/**
	* Draw tile
	*
	* @param {int} number - Canvas position to clear
	*/
	clearCanvas(number) {
		if(number == 1) {
			this.mapCtx.clearRect(0, 0, this.mapCtx.canvas.width, this.mapCtx.canvas.height);
		} else if(number == 2) {
			this.tileCtx.clearRect(0, 0, this.tileCtx.canvas.width, this.tileCtx.canvas.height);
		} else if(number == 3) {
			this.charCtx.clearRect(0, 0, this.charCtx.canvas.width, this.charCtx.canvas.height);
		}
	}

	/**
	* Add all frame for this slime color
	* @param {map} mapImg - Current images to load
	* @param {string} color - Color of the slime
	*/
	putSlimeImage(mapImg, color) {
		if(!this.images.has(color + Play.Direction.RIGHT) && !mapImg.has(color + Play.Direction.RIGHT)) {
			mapImg.set(color + Play.Direction.UP, "images/slimes/slime-" + color + "-up.png");
			mapImg.set(color + Play.Direction.LEFT, "images/slimes/slime-" + color + "-left.png");
			mapImg.set(color + Play.Direction.DOWN, "images/slimes/slime-" + color + "-down.png");
			mapImg.set(color + Play.Direction.RIGHT, "images/slimes/slime-" + color + "-right.png");
		}
	}

}