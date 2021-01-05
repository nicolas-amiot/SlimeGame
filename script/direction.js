const direction = {
	UP: 1,
	LEFT: 2,
	DOWN: 3,
	RIGHT: 4
};

// Isometric tile renderer
class IsometricMap {
	
	static get direction() {
		return direction;
	}
	
	constructor(layer1, layer2, layer3) {
		this.map = undefined;
		this.tileLength = 200;
		this.tileWidth = 100;
		this.tileHeight = 130;
		this.tilesX = 0;
		this.tilesY = 0;
		this.originX = 0;
		this.originY = 0;
		this.selectedTileX = -1;
		this.selectedTileY = -1;
		this.mapCtx = document.getElementById(layer1).getContext("2d");
		this.tileCtx = document.getElementById(layer2).getContext("2d");
		this.charCtx = document.getElementById(layer3).getContext("2d");
		this.tileImages = new Array();
		this.properties = new Array();
		this.posX = 0;
		this.posY = 0;
		this.skill = false;
	}

	load(map, callback) {
		var self = this;
		
		$.getJSON("maps/" + map + ".json", function(json) {
			var loadedImages = 0;
			self.map = json.map;
			var totalImages = json.tiles.length;

			// Load all the images
			for(var i = 0; i < totalImages; i++) {
				self.tileImages[i] = new Image();
				self.tileImages[i].src = json.tiles[i].filename;
				self.properties[i] = json.tiles[i].properties;
				// Toutes les images ont été chargées
				self.tileImages[i].onload = function() {
					if(++loadedImages >= totalImages) {
						self.run();
						callback(); 
					}
				};
			}
		});
	}
	
	run() {
		var self = this;

		// Number X and Y tiles
		this.tilesX = this.map.length;
		this.tilesY = this.map[0].length;

		this.updateCanvasSize();
		this.redrawMap();
		this.posX = 4;
		this.posY = 4;
		this.drawCharacter(this.posX, this.posY, 120, 80)
		
		$(window).resize(function(){
			self.updateCanvasSize();
			self.redrawMap();
		});
		
		$(window).keyup(function(e){
			var which = e.which;
			if(which == 87 || which == 90 || which == 38) { // W or Z or up
				self.drawAnimation(IsometricMap.direction.UP, 1);
			} else if(which == 65 || which == 81 || which == 37) { // A or Q or left
				
			} else if(which == 83 || which == 40) { // S or down
				
			} else if(which == 68 || which == 39) { // D or right
				
			} else if(which == 69 || which == 13) { // E or enter
				
			}
		});
	}
	
	updateCanvasSize() {
		var width = $(window).width();
		var height = $(window).height();

		// Canvas take all screen 
		this.mapCtx.canvas.width = width;
		this.mapCtx.canvas.height = height;
		this.tileCtx.canvas.width = width;
		this.tileCtx.canvas.height = height;
		this.charCtx.canvas.width = width;
		this.charCtx.canvas.height = height;

		// Center map
		this.originX = width / 2 - (this.tilesX - 1) * this.tileLength / 2;
		this.originY = height /2;
	}

	redrawMap() {
		// Clear canvas
		this.mapCtx.clearRect(0, 0, this.mapCtx.canvas.width, this.mapCtx.canvas.height);

		// Draw tiles with display priority 
		for(var x = (this.tilesX - 1); x >= 0; x--) {
			for(var y = 0; y < this.tilesY; y++) {
				this.drawTile(x, y);
			}
		}
	}

	drawTile(x, y) {
		var offX = (x - 1) * this.tileLength / 2 + y * this.tileLength / 2 + this.originX;
		var offY = (y - 1) * this.tileWidth / 2 - x * this.tileWidth / 2 + this.originY;

		var indexTile = this.map[x][y];
		// 0 est reservé pour aucune tile
		if(indexTile > 0)
		{
			var image = this.tileImages[indexTile - 1];
			// Pour les images dont la hauteur depasse celle du sol, on les élèves
			if(image != undefined) {
				var ratio = this.tileLength / image.width;
				if(image.height * ratio <= this.tileHeight) {
					this.mapCtx.drawImage(image, offX, offY, image.width * ratio, image.height * ratio);
				} else {
					this.mapCtx.drawImage(image, offX, offY - (image.height * ratio - this.tileHeight), image.width * ratio, image.height * ratio);
				}
			}
		}
	}
	
	drawAnimation(direction, number) {
		if(direction == this.Direction.UP) {
			isometricMap.drawCharacter(this.posX, this.posY + number, 85, 50);
			this.posY += number;
		} else if(direction == this.Direction.LEFT) {
			
		} else if(direction == this.Direction.DOWN) {
			
		} else if(direction == this.Direction.RIGHT) {
			
		}
	}
	
	drawCharacter(x, y, w, h) {
		var self = this;
		var character = new Image();
		character.src = "images/characters/slime1.png";
		var offX = (x - 1) * this.tileLength / 2 + y * this.tileLength / 2 + this.originX;
		var offY = (y - 1) * this.tileWidth / 2 - x * this.tileWidth / 2 + this.originY;
		offX = offX + this.tileLength * 0.25 - (w - this.tileWidth) / 2;
		offY = offY - this.tileWidth * 0.25 - (h - this.tileWidth);
		character.onload = function() {
			// Clear canvas
			self.charCtx.clearRect(0, 0, self.charCtx.canvas.width, self.charCtx.canvas.height);
			self.charCtx.drawImage(character, offX, offY, w, h);
		};
	}

}
