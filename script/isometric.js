// Isometric tile renderer
class IsometricMap {
	
	constructor(tileMap, layer1, layer2, layer3, layer4) {
		this.tileMap = tileMap;
		this.tileLength = 100;
		this.tileWidth = 50;
		this.tileHeight = 65;
		this.tilesX = 0;
		this.tilesY = 0;
		this.originX = 0;
		this.originY = 0;
		this.selectedTileX = -1;
		this.selectedTileY = -1;
		this.mapCtx = document.getElementById(layer1).getContext("2d");
		this.objCtx = document.getElementById(layer2).getContext("2d");
		this.aniCtx = document.getElementById(layer3).getContext("2d");
		this.actCtx = document.getElementById(layer4).getContext("2d");
		this.tileImages = new Array();
		this.showCoordinates = false;
	}

	load(callback) {
		var self = this;
		
		var loadedImages = 0;
		var totalImages = this.tileMap.tiles.length;

		// Load all the images
		for(var i = 0; i < this.tileMap.tiles.length; i++) {
			this.tileImages[i] = new Image();
			this.tileImages[i].src = this.tileMap.tiles[i].filename;
			// Toutes les images ont été chargées
			this.tileImages[i].onload = function() {
				if(++loadedImages >= totalImages) {
					self.run();
					callback(); 
				}
			};
		}
	}
	
	run() {
		var self = this;

		// Number X and Y tiles
		this.tilesX = this.tileMap.map.length;
		this.tilesY = this.tileMap.map[0].length;

		$(window).on('resize', function(){
			self.updateCanvasSize();
			self.redrawMap();
		});

		$(window).on('mousemove', function(e) {
			e.pageX = e.pageX - self.originX;
			e.pageY = e.pageY - self.originY;
			var tileX = Math.round(e.pageX / self.tileLength - e.pageY / self.tileWidth);
			var tileY = Math.round(e.pageX / self.tileLength + e.pageY / self.tileWidth);

			self.selectedTileX = tileX;
			self.selectedTileY = tileY;
			self.redrawAction();
		});

		$(window).on('click', function() {
			self.showCoordinates = !self.showCoordinates;
			self.redrawObject();
		});

		this.updateCanvasSize();
		this.redrawMap();
	}
	
	updateCanvasSize() {
		var width = $(window).width();
		var height = $(window).height();

		// Canvas take all screen 
		this.mapCtx.canvas.width = width;
		this.mapCtx.canvas.height = height;
		this.objCtx.canvas.width = width;
		this.objCtx.canvas.height = height;
		this.aniCtx.canvas.width = width;
		this.aniCtx.canvas.height = height;
		this.actCtx.canvas.width = width;
		this.actCtx.canvas.height = height;

		// Center map
		this.originX = width / 2 - (this.tilesX - 1) * this.tileLength / 2;
		this.originY = (this.tilesY + 1) * this.tileWidth / 2; // height /2 for center
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
	
	redrawObject() {
		// Clear canvas
		this.objCtx.clearRect(0, 0, this.objCtx.canvas.width, this.objCtx.canvas.height);
		
		if(this.isCursorOnmap()) {
			// Show tile name
			if(this.showCoordinates) {
				for(var x = (this.tilesX - 1); x >= 0; x--) {
					for(var y = 0; y < this.tilesY; y++) {
						var offX = (x - 1) * this.tileLength / 2 + y * this.tileLength / 2 + this.originX;
						var offY = (y - 1) * this.tileWidth / 2 - x * this.tileWidth / 2 + this.originY;
						this.objCtx.fillStyle = 'orange';
						this.objCtx.font = '10pt Arial';
						this.objCtx.fillText(x + ",y " + y, offX + this.tileLength/2 - 9, offY + this.tileWidth/2 + 3);
					}
				}
			}
		}
	}
	
	redrawAnimate() {
		// Clear canvas
		this.aniCtx.clearRect(0, 0, this.aniCtx.canvas.width, this.aniCtx.canvas.height);
	}
	
	redrawAction() {
		// Clear canvas
		this.actCtx.clearRect(0, 0, this.actCtx.canvas.width, this.actCtx.canvas.height);
		
		if(this.isCursorOnmap()) {
			// Draw diamond border for current tile
			this.drawDiamond(this.actCtx, this.selectedTileX, this.selectedTileY, 'yellow');
		}
	}

	drawTile(x, y) {
		var offX = (x - 1) * this.tileLength / 2 + y * this.tileLength / 2 + this.originX;
		var offY = (y - 1) * this.tileWidth / 2 - x * this.tileWidth / 2 + this.originY;

		var indexTile = this.tileMap.map[x][y];
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

	drawDiamond(ctx, x, y, color) {
		var offX = x * this.tileLength / 2 + y * this.tileLength / 2 + this.originX;
		var offY = y * this.tileWidth / 2 - x * this.tileWidth / 2 + this.originY;
		var top = offY + this.tileWidth / 2;
		var bot = offY - this.tileWidth / 2;
		var right = offX + this.tileLength / 2
		var left = offX - this.tileLength / 2;
		
		color = typeof color !== 'undefined' ? color : 'white';
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;

		ctx.beginPath();
		ctx.moveTo(offX, top);
		ctx.lineTo(right, offY);
		ctx.lineTo(offX, bot);
		ctx.lineTo(left, offY);
		ctx.closePath();
		ctx.stroke();
	}
	
	drawArea(area) {
		for(var i = 0; i < area.boxes.length; i++) {
			var box = area.boxes[i];
			this.drawDiamond(this.objCtx, area.x + box.x, area.y + box.y, box.color);
			this.objCtx.fillStyle = box.color;
			this.objCtx.fill();
		}
	}
	
	drawCharacter(x, y, w, h) {
		var self = this;
		var character = new Image();
		character.src = "files/character/slime1.png";
		var offX = (x - 1) * this.tileLength / 2 + y * this.tileLength / 2 + this.originX;
		var offY = (y - 1) * this.tileWidth / 2 - x * this.tileWidth / 2 + this.originY;
		offX = offX + this.tileLength * 0.25 - (w - this.tileWidth) / 2;
		offY = offY - this.tileWidth * 0.25 - (h - this.tileWidth);
		character.onload = function() {
			// Clear canvas
			self.redrawAnimate();
			self.aniCtx.drawImage(character, offX, offY, w, h);
		};
	}
	
	isCursorOnmap() {
		var show = false;
		if(this.selectedTileX >= 0 && this.selectedTileX < this.tilesX && this.selectedTileY >= 0 && this.selectedTileY < this.tilesY) {
			var index = this.tileMap.map[this.selectedTileX][this.selectedTileY];
			if(index > 0 && this.tileMap.tiles[index - 1] != undefined) {
				var properties = this.tileMap.tiles[index - 1].properties;
				if(!properties.includes("obstructable")) {
					show = true;
				}
			}
		}
		return show;
	}

}
