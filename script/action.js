// Isometric tile renderer
class ActionBar {
	
	constructor(idSummary, idTimer, idTeams, idSpell) {
		this.summary = document.getElementById(idSummary);
		this.timer = document.getElementById(idTimer);
		this.teams = document.getElementById(idTeams);
		this.spell = document.getElementById(idSpell);
		
		this.leftTimer = $(this.timer).find('.progress-left .progress-bar');
		this.rightTimer = $(this.timer).find('.progress-right .progress-bar');
		this.buttonTimer = $(this.timer).find('.progress-value').children('button');
		this.valueTimer = this.buttonTimer.children('.h1');
		this.iTimer = undefined;
	}
	
	startTimer(seconds, animated) {
		var self = this;
		this.leftTimer.css('transform', 'rotate(180deg)');
		this.rightTimer.css('transform', 'rotate(180deg)');
		this.valueTimer.text(seconds + "s");
		this.buttonTimer.prop('disabled', false);
		var ms = 1000;
		var total = seconds * ms;
		var part = total / 2;
		var current = 0;
		
		if(!animated) {
			this.iTimer = setInterval(function(){
				current += ms;
				var deg =  Math.max((part - current) / part * 180, 0);
				self.leftTimer.css('transform', 'rotate(' + deg + 'deg)');
				deg = Math.min((total - current) / part * 180, 180);
				self.rightTimer.css('transform', 'rotate(' + deg + 'deg)');
				self.valueTimer.text((seconds - current / ms) + "s");
				if(current >= total) {
					self.endTimer();
				}
			}, ms);
		} else {
			setTimeout(function(){
				self.leftTimer.addClass("progress-transition");
				self.rightTimer.addClass("progress-transition");
				var deg =  (part - ms / 2) / part * 180;
				self.leftTimer.css('transform', 'rotate(' + deg + 'deg)');
			}, 1); // Bug : The transition is used even if it's added after. Prevent using the transition to fill the progress bar
			this.iTimer = setInterval(function(){
				current += ms / 2;
				if(current < part) {
					var deg =  (part - current - ms / 2) / part * 180;
					self.leftTimer.css('transform', 'rotate(' + deg + 'deg)');
				} else if(current < total) {
					var deg =  (total - current - ms / 2) / part * 180;
					self.rightTimer.css('transform', 'rotate(' + deg + 'deg)');
				}
				if(Number.isInteger(seconds - current / ms)) {
					self.valueTimer.text((seconds - current / ms) + "s");
				}
				if(current >= total) {
					self.endTimer();
				}
			}, ms / 2);
		}
		$(this.buttonTimer).click(function(e) {
			self.endTimer();
		});
		$(window).keydown(function(e) {
			var code = e.keyCode || e.which;
			if(code == 66) {
				self.endTimer();
			}
		});
	}
	
	endTimer() {
		if(this.iTimer != undefined) {
			clearInterval(this.iTimer);
		}
		this.leftTimer.removeClass("progress-transition");
		this.rightTimer.removeClass("progress-transition");
		this.leftTimer.css('transform', 'rotate(0deg)');
		this.rightTimer.css('transform', 'rotate(0deg)');
		this.valueTimer.text("0s");
		this.buttonTimer.prop('disabled', true);
	}

}
