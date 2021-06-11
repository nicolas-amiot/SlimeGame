$(document).ready(function(){
	
	// Create the map and game objects
	let tilemap = new Tilemap("map", "tile", "char");
	let screen = new Screen();
	let play = new Play(screen, tilemap);
	screen.menu(Screen.Display.MENU);
	tilemap.loadBackground();
	$('#animate').on("input", function() {
		play.animate = $(this).val() * 1000;
		$(this).next("output").val($(this).val() + " s");
	});
	
	// Cookie
	$('#cookie').change(function() {
		play.cookie = $(this).is(':checked');
	});
	$('#deleteCookie').click(function() {
		Cookies.remove('levels', { path: '' });
	});
	
	// Music game
	let audio = new Audio('music/Komiku_-_09_-_De_lherbe_sous_les_pieds.mp3');
	audio.loop = true;
	$('#audio').on("input", function() {
		let volume = $(this).val();
		if(volume != 0) {
			audio.play();
		} else {
			audio.pause();
		}
		audio.volume = $(this).val();
		$(this).next("output").val($(this).val() * 100 + " %");
	});
	
	// Load maps modal
	let totalMaps = 40;
	let modal = $("#maps");
	let row = null;
	for(let i = 1; i <= totalMaps; i++) {
		if(i%10 == 1) {
			row = $('<div class="row"></div>');
			modal.append(row);
		}
		row.append(
			'<div class="col">' +
				'<button name="level" value="' + i + '" class="btn btn-lg btn-light" data-dismiss="modal">' +
					i + '<span class="d-none" />' +
				'</button>' +
			'</div>'
		);
	}
	$("#modalLevel").on('shown.bs.modal', function () {
		$(this).find('button[name="level"]').each(function() {
			let level = parseInt($(this).val());
			if(play.success.length >= level) {
				let success = play.success.charAt(level - 1);
				let span = $(this).children("span");
				if(success == '1') {
					span.addClass("checkmark");
					span.removeClass("d-none");
				} else if(success == '2') {
					span.addClass("star");
					span.removeClass("d-none");
				}
			}
		});
	});
	
	// Launch the game
	$('button[name="level"]').click(function() {
		play = new Game(screen, tilemap);
		screen.menu(Screen.Display.GAME);
		play.level = parseInt($(this).val());
		play.start();
	});
	
	// Editor button
	$('#editor').click(function() {
		play = new Editor(screen, tilemap);
		play.confugure(7, 7);
		play.screen.menu(Screen.Display.EDITOR);
		play.initialize(true);
		play.createSelector("selector");
		screen.updateBubble("Description de la carte");
	});
	
	// Play button
	$('#play').click(function() {
		play.checkCompliance();
	});
	
	// Restart button
	$('#restart').click(function() {
		if(play.ready) {
			play.restart();
		}
	});
	
	// Restart button
	$('#again').click(function() {
		play.restart();
	});
	
	// Stop button
	$('#stop').click(function() {
		play.screen.menu(Screen.Display.EDITOR);
		play.initialize(false);
	});
	
	// Upload map
	$('#upload').change(function() {
		if(this.files[0] != null) {
			let reader = new FileReader();
			reader.readAsText(this.files[0], "UTF-8");
			this.value = null;
			reader.onload = function (e) {
				play.loadJSON(JSON.parse(e.target.result));
				play.confugure(play.data.tilesX, play.data.tilesY);
				play.initialize(false);
			}
		}
	});
	
	// Redraw map when resize
	$(window).resize(function() {
		play.redraw();
	});
	
	// Key for play
	$(document).keypress(function(e) {
		if(screen.name == Screen.Display.GAME || screen.name == Screen.Display.TEST) {
			e.preventDefault();
		}
	});
	$(document).keyup(function(e) {
		if(screen.name == Screen.Display.GAME || screen.name == Screen.Display.TEST) {
			e.preventDefault();
			let which = e.which;
			if(play.ready) {
				if(which == 87 || which == 90 || which == 38) { // W or Z or up
					$("#up").focus();
					play.moveDirection(Play.Direction.UP);
				} else if(which == 65 || which == 81 || which == 37) { // A or Q or left
					$("#left").focus();
					play.moveDirection(Play.Direction.LEFT);
				} else if(which == 83 || which == 40) { // S or down
					$("#down").focus();
					play.moveDirection(Play.Direction.DOWN);
				} else if(which == 68 || which == 39) { // D or right
					$("#right").focus();
					play.moveDirection(Play.Direction.RIGHT);
				} else if(which == 69 || which == 13) { // E or enter
					$("#action").focus();
					play.useSkill();
				} else if(which == 32) { // space
					play.nextDialog();
				}
			} else if(which == 32 && screen.name != Screen.Display.EDITOR) {
				play.screen.displayBubble(false);
			}
		}
	});
	
	// Controller
	$('.command').click(function() {
		let id = $(this).attr("id");
		if(play.ready) {
			if(id == "up") {
				play.moveDirection(Play.Direction.UP);
			} else if(id == "left") {
				play.moveDirection(Play.Direction.LEFT);
			} else if(id == "down") {
				play.moveDirection(Play.Direction.DOWN);
			} else if(id == "right") {
				play.moveDirection(Play.Direction.RIGHT);
			} else if(id == "action") {
				play.useSkill();
			} else if(id == "next") {
				play.nextDialog();
			}
		} else if(id == "next" && screen.name != Screen.Display.EDITOR) {
			play.screen.displayBubble(false);
		}
	});
	
	// Selector
	$("#selector > div").mouseenter(function() {
		play.hideLines("selector");
	});
	$("#selector").mouseenter(function() {
		$(this).children("ul").removeClass("d-none");
	});
	$(".panel-command").mouseleave(function() {
		$("#selector").children("ul").addClass("d-none");
	});
	$("#selector").on("click", ".selector", function() { // Use on event for dynamic element
		if(this.id != "selection") {
			let list = $(this).closest("ul");
			if(list.children("li").first().hasClass("d-none")) {
				play.hideLines("selector");
				list.children("li").removeClass("d-none");
			} else {
				$("#selector").children("ul").addClass("d-none");
				$("#selection").attr("name", $(this).attr("name"));
				$("#selection > img").attr("src", $(this).children("img").attr("src"));
				play.selection = null;
			}
		} else {
			let list = $("#selector > ul");
			if(list.hasClass("d-none")) {
				play.hideLines("selector");
				list.removeClass("d-none");
			} else {
				list.addClass("d-none");
			}
		}
	});
	$("#selector ul").on("mouseleave", "li ul", function() { // Use on event for dynamic element
		play.hideLines("selector");
	});
	$("#selector ul").on("mouseenter", "li ul", function() { // Use on event for dynamic element
		$(this).children("li").removeClass("d-none");
	});
	
	// Menu
	$(document).contextmenu(function(e) {
		if(screen.name == Screen.Display.EDITOR) {
			e.preventDefault();
		}
	});
	
	// Edition
	$(document).on("input", "[contenteditable='true']", function() {
		let min = $(this).attr("min");
		let max = $(this).attr("max");
		if(min != null && max != null) {
			let val = parseInt($(this).text());
			if(isNaN(val)) {
				val = $(this).text().replace(/\D/g, "");
			} else if(val < min) {
				val = min;
			} else if(val > max) {
				val = max;
			} else if(val.toString() != $(this).text()) {
				val = val;
			} else {
				val = null;
			}
			if(val != null) {
				$(this).text(val);
				let range = document.createRange();
				range.selectNodeContents(this);
				range.collapse(false);
				let sel = window.getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}
		if($(this).parent()[0].id == "grid" && $(this).text().length > 0) {
			let grid = $(this).parent().children("span");
			play.confugure($(grid[1]).text(), $(grid[0]).text());
			play.initialize(true);
		}
	});
	
	// Mouse click and hold
	let hold = false;
	let right = false;
	$(document).bind("mousemove", function(e) {
		if(screen.name == Screen.Display.EDITOR && $("#selector ul").hasClass("d-none")) {
			let name = $("#selection").attr("name");
			if(!right) {
				if(name == "slime" || name == "enemy") {
					play.previewSlime(e, name, false);
				} else if(name == "cursor" && play.selection != null) {
					play.previewTile(e, play.selection.tile.name);
				} else if(name == "editor") {
					// NOTHING
				} else if(name == "eraser") {
					play.previewTile(e, null);
				} else {
					play.previewTile(e, name);
				}
			}
			if(hold) {
				mousehold(e, right);
			}
		}
	}).bind('mousedown', function(e) {
		if(screen.name == Screen.Display.EDITOR && $("#selector ul").hasClass("d-none")) {
			if(e.which == 1) { // left click
				hold = true;
				right = false;
				mousehold(e, right);
			} else if(e.which == 3) { // right click
				hold = true;
				right = true;
				mousehold(e, right);
			}
		}
	}).bind('mouseup', function(e) {
		if(screen.name == Screen.Display.EDITOR && $("#selector ul").hasClass("d-none")) {
			let name = $("#selection").attr("name");
			if(!right) {
				if(name == "editor") {
					play.editTile(e, false);
				}
			} else {
				if(name == "slime" || name == "enemy") {
					play.previewSlime(e, name, true);
				} else if(name == "cursor") {
					play.copyTile(e);
				} else if(name == "editor") {
					play.editTile(e, true);
				} else if(name == "eraser") {
					play.createTileSelection(e, null);
				} else {
					play.createTileSelection(e, name);
				}
			}
			hold = false;
			right = false;
		}
	}).bind('mouseleave', function() {
		hold = false;
		right = false;
	});
	
	function mousehold(e, right) {
		let name = $("#selection").attr("name");
		if(!right) {
			if(name == "slime" || name == "enemy") {
				play.createSlime(e, name);
			} else if(name == "cursor") {
				play.pasteTile(e);
			} else if(name == "editor") {
				// NOTHING
			} else if(name == "eraser") {
				play.createTile(e, null);
			} else {
				play.createTile(e, name);
			}
		} else {
			if(name == "slime" || name == "enemy") {
				// NOTHING
			} else if(name == "cursor") {
				// NOTHING
			} else if(name == "editor") {
				// NOTHING
			} else if(name == "eraser") {
				play.previewSelection(e);
			} else {
				play.previewSelection(e);
			}
		}
	}

});
