/**
* @class Messages
*/
class Messages {
	
	/**
	* Constructor for screen class
	*
	* @param {string} folder - Language files location
	* @param {array} languages - Valid languages, first language is the default
	*/
	constructor(folder, ...languages) {
		if(folder == null) {
			folder = "lang";
		}
		this.folder = folder
		this.languages = languages;
		this.language = null;
		this.messages = new Object();
	}
	
	/**
	* Read the corresponding language file 
	*
	* @param {string} lang - The language to use or by default the navigator language
	*/
	lang(lang) {
		if(lang == null || lang.length == 0) {
			lang =  navigator.language; // exemple : en, en-US, fr, fr-FR, es-ES
			if(lang == null) {
				lang = this.languages[0];
			} else if(lang.length > 2) {
				lang = lang.substring(0, 2);
				if(!this.languages.includes(lang)) {
					lang = this.languages[0];
				}
			}
		}
		let promise = new Promise((resolve) => {
			let self = this;
			let request = new XMLHttpRequest();
			this.language = lang;
			request.open("GET", this.folder + "/" + lang + ".json");
			request.onload = function() {
				self.messages = JSON.parse(request.response);
				resolve(true);
			};
			request.onerror = function() {
				resolve(false);
			};
			request.send();
		});
		return promise;
	}
	
	/**
	* Get the message
	*
	* @param {string} key - Key message
	* @param {array} params - Optional params message
	*/
	get(key, ...params) {
		let message = null;
		if(this.messages != null && key != null && key.length > 0) {
			message = this.messages[key];
			if(message != null) {
				for(let i = 1; i <= params.length; i++) {
					message = message.replaceAll("$" + i, params[i - 1]);
				}
			}
		}
		return message;
	}
	
	/**
	* Replace all messages in the dom for elements contending the data lang attribute
	*
	* @param {boolean} replace - If true, the tag is removed
	* @param {boolean} html - If true, the message is treated as html
	*/
	dom(replace, html) {
		let elements = document.querySelectorAll('*[data-lang]');
		for(let element of elements) {
			this.elm(element, replace, html);
		}
	}
	
	/**
	* Replace the message for this element
	*
	* @param {element} element - The element to modify
	* @param {boolean} replace - If true, the tag is removed
	* @param {boolean} html - If true, the message is treated as html
	*/
	elm(element, replace, html) {
		if(element != null) {
			let lang = element.dataset.lang;
			let message = null;
			if(lang != null) {
				if(lang.includes(",")) {
					lang = lang.split(",").map(item => item.trim());
					let key = lang[0];
					lang.splice(0, 1);
					message = this.get(key, lang);
				} else {
					message = this.get(lang.trim());
				}
			}
			this.set(element, message, replace, html);
		}
	}
	
	/**
	* Replace the message for this element
	*
	* @param {element} element - The element to modify
	* @param {string} message - The new message
	* @param {boolean} replace - If true, the tag is removed
	* @param {boolean} html - If true, the message is treated as html
	*/
	set(element, message, replace, html) {
		if(element != null) {
			if(message == null) {
				message = "";
			}
			if(!replace && !html) {
				element.textContent = message;
			} else if(replace && !html) {
				element.parentNode.replaceChild(document.createTextNode(message), element);
			} else if(!replace && html) {
				element.innerHTML = message;
			} else {
				element.outerHTML = message;
			}
		}
	}
	
	/**
	* Add the data lang attribute to the element
	*
	* @param {element} element - Element to add the attribute
	* @param {string} key - Key message
	* @param {array} params - Optional params message
	*/
	data(element, key, ...params) {
		if(element != null) {
			if(key != null && key.length > 0) {
				let lang = key;
				if(params != null && params.length > 0) {
					lang += "," + params.join(",");
				}
				element.dataset.lang = lang;
			} else {
				element.removeAttribute("data-lang");
			}
		}
	}

}