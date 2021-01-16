$(document).ready(function(){
	
	// Create the map and game objects
	let isometricMap = new IsometricMap("map", "tile", "char");
	let screen = new Screen("level", "puddle", "life", "food", "slime", "bubble");
	let game = new Game(isometricMap, screen);
	$('#animate').on("input", function() {
		game.animate = $(this).val() * 1000;
		$(this).next("output").val($(this).val() + " s");
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
	let totalMaps = 20;
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
					i + '<span class="d-none checkmark" />' +
				'</button>' +
			'</div>'
		);
	}
	$("#modalLevel").on('shown.bs.modal', function () {
		$(this).find('button[name="level"]').each(function() {
			if(game.success.includes(parseInt($(this).val()))) {
				$(this).children(".checkmark").removeClass("d-none");
			}
		});
	});
	$("#modalLevel").modal("show");
	
	// Launch the game
	$('button[name="level"]').click(function() {
		game.level = parseInt($(this).val());
		game.start();
	});
	
	// Restart button
	$('#restart').click(function() {
		if(game.ready) {
			game.restart();
		}
	});
	
	// Redraw map when resize
	$(window).resize(function() {
		if(game.ready) {
			game.redraw();
		}
	});
	
	// Key for play
	$(document).keypress(function(e) {
		e.preventDefault();
	});
	$(document).keyup(function(e) {
		e.preventDefault();
		if(game.ready) {
			let which = e.which;
			if(which == 87 || which == 90 || which == 38) { // W or Z or up
				$("#up").focus();
				game.moveDirection(Game.Direction.UP);
			} else if(which == 65 || which == 81 || which == 37) { // A or Q or left
				$("#left").focus();
				game.moveDirection(Game.Direction.LEFT);
			} else if(which == 83 || which == 40) { // S or down
				$("#down").focus();
				game.moveDirection(Game.Direction.DOWN);
			} else if(which == 68 || which == 39) { // D or right
				$("#right").focus();
				game.moveDirection(Game.Direction.RIGHT);
			} else if(which == 69 || which == 13) { // E or enter
				$("#action").focus();
				game.useSkill();
			} else if(which == 32) { // space
				game.nextDialog();
			}
		}
	});
	
	// Button for play
	$('.command').click(function() {
		if(game.ready) {
			let id = $(this).attr("id");
			if(id == "up") {
				game.moveDirection(Game.Direction.UP);
			} else if(id == "left") {
				game.moveDirection(Game.Direction.LEFT);
			} else if(id == "down") {
				game.moveDirection(Game.Direction.DOWN);
			} else if(id == "right") {
				game.moveDirection(Game.Direction.RIGHT);
			} else if(id == "action") {
				game.useSkill();
			} else if(id == "next") {
				game.nextDialog();
			}
		}
	});

});
