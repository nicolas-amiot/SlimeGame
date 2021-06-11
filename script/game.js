/**
* @class Game
*/
class Game extends Play {
	
	/**
	* Constructor for game class
	*
	* @param {Screen} screen - Screen element
	* @param {Tilemap} tilemap - Isometric tile map
	*/
	constructor(screen, tilemap) {
		super(screen, tilemap);
		this.level = 0; // Map level
	}
	
	/**
	* Start the game
	*/
	start() {
		let self = this;
		this.ready = false;
		this.screen.displayLoader(true);
		$.getJSON("maps/level" + self.level + ".json", function(json) {
			self.loadJSON(json);
			self.tilemap.loadMap(self.tiles, self.data.enemy, function() {
				self.tilemap.updateMapSize(self.data.tilesX, self.data.tilesY);
				self.tilemap.redrawTiles(self.tiles);
				self.screen.displayLevel(true);
				self.screen.updateLevel(self.level);
				self.init();
			});
		}).fail(function() {
			$("#modalLevel").modal("show");
			self.tilemap.updateMapSize();
		});
	}
	
	/**
	* Restart the game
	*/
	restart() {
		this.screen.updateStroke(this.data.stroke);
		this.reload();
	}
	
	/**
	* Update the game
	*/
	update() {
		this.screen.updateStroke(this.data.stroke - this.stroke);
	}
	
	/**
	* End the game
	*/
	end() {
		this.addSuccess();
		this.level++;
		this.start();
	}
	
	/**
	* Redraw map, puddles and slimes
	*/
	redraw() {
		this.tilemap.updateMapSize(this.data.tilesX, this.data.tilesY);
		this.tilemap.redrawPuddles(this.puddles);
		this.tilemap.redrawTiles(this.tiles);
		this.tilemap.redrawSlimes(this.slime, this.enemy);
	}
	
	/**
	* Add this level in success
	*/
	addSuccess() {
		let digit;
		if(this.stroke > this.data.stroke) {
			digit = '1';
		} else {
			digit = '2';
		}
		let dif = this.level - this.success.length;
		if(dif > 0) {
			for(let i = 1; i < dif; i++) {
				this.success += "0";
			}
			this.success += digit;
		} else {
			let current = this.success.charAt(this.level - 1);
			if(current < digit) {
				this.success = this.success.substring(0, this.level - 1) + digit + this.success.substring(this.level);
			}
		}
		if(this.cookie) {
			Cookies.set('levels', this.success, { expires: 365, path: '' });
		}
	}

}