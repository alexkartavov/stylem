$(function () {

	var idLength = 20;
	var ignorCssFiles = ["stylem.css", "bootstrap.css"];
	var stylemContainer = null;

	function ignoreThisCss(href) {
		if (!href)
			return false;
		for(var i = 0; i< ignorCssFiles.length;i++){
			if (href.substring(href.length - ignorCssFiles[i].length) == ignorCssFiles[i])
				return true;
		}
		return false;
	}

	function shortId(id) {
		if (id)
			return (id.length > idLength ? "..." : "") + id.substring(id.length - idLength);
		return "";
	}

	function toggleStyleInfo(evt) {
		if (evt.currentTarget != evt.target)
			return;
		$(this.lastChild).toggle();
	}

	function hasProperties(obj) {
		for (var p in obj) {
			if (!obj.hasOwnProperty(p))
				continue;
			return true;
		}
		return false;
	}

	function findStyleSheet(id) {
		for (var i = 0; i < document.styleSheets.length; i++) {
			var ss = document.styleSheets[i];
			if (ss.href == id || ss.id == id)
				return ss;
		}
		return null;
	}

	function findCssRule(styleSheet, selector) {

	}

	function findCssSetting(cssRule, setting) {

	}

	var pageStyleSheets = [];
	function registerStyleChanges() {
		var changes = {
			removedStyles: [],
			linkedStyles: []
		};
		for (var i = 0; i < pageStyleSheets.length; i++) {
			var chRules = pageStyleSheets[i].changedRules;
			if (hasProperties(chRules)) {
				for (var selector in chRules) {
					if (chRules.hasOwnProperty(selector)) {
						var rule = chRules[selector];
						if (hasProperties(rule.removedStyles)) {
							var rs = {selector: selector, styles: []};
							for (var s in rule.removedStyles) {
								if (rule.removedStyles.hasOwnProperty(s)) {
									rs.styles.push(s);
								}
							}
							changes.removedStyles.push(rs);
						}
						if (hasProperties(rule.linkedStyles)) {
							var rs = { selector: selector, links: [] };
							for (var s in rule.linkedStyles) {
								if (rule.linkedStyles.hasOwnProperty(s)) {
									rs.links.push({ name: s, link: rule.linkedStyles[s] });
								}
							}
							changes.linkedStyles.push(rs);
						}
					}
				}
			}
		}
		injectChanges(changes);
	}

	var emptyDiv = null;
	function injectChanges(changes) {
		var styleEl = $("#__injectedStyles");
		if (styleEl.length)
			styleEl[0].parentNode.removeChild(styleEl[0]);

		styleEl = document.createElement("style");
		styleEl.setAttribute("rel", "stylesheet");
		styleEl.setAttribute("id", "__injectedStyles");
		document.body.appendChild(styleEl);

		var injectedStyles = document.styleSheets[document.styleSheets.length - 1];

		if (!emptyDiv) {
			emptyDiv = document.createElement("div");
			emptyDiv.setAttribute("id", "__emptyDiv");
		}
		document.body.appendChild(emptyDiv);

		var emptyStyle = window.getComputedStyle(emptyDiv);

		for (var i = 0; changes.removedStyles && i < changes.removedStyles.length; i++) {
			var remStyle = changes.removedStyles[i];

			console.log(remStyle.selector);

			var cssText = "";
			for (var j = 0; j < remStyle.styles.length; j++) {
				var remSettingName = remStyle.styles[j];
				var remSettingValue = defaultStyleValue(remSettingName, emptyStyle);
				if (remSettingValue) {
					var remSetting = remSettingName + ": " + remSettingValue + ";";
					console.log(remSetting);
					cssText += remSetting;
				}
				else {
					console.log("Could not find default value for: " + remSettingName);
				}
			}

			if (injectedStyles.insertRule) {
				injectedStyles.insertRule(remStyle.selector + " {" + cssText + "}", injectedStyles.cssRules ? injectedStyles.cssRules.length : 0);
			}
			else if (injectedStyles.addRule) {
				injectedStyles.addRule(remStyle.selector, cssText);
			}
		}

		for (var i = 0; changes.linkedStyles && i < changes.linkedStyles.length; i++) {
			var linkStyle = changes.linkedStyles[i];

			console.log(linkStyle.selector);

			var cssText = "";
			for (var j = 0; j < linkStyle.links.length; j++) {
				var linkedStyle = linkStyle.links[j];

			}

			if (injectedStyles.insertRule) {
				injectedStyles.insertRule(linkStyle.selector + " {" + cssText + "}", injectedStyles.cssRules ? injectedStyles.cssRules.length : 0);
			}
			else if (injectedStyles.addRule) {
				injectedStyles.addRule(linkStyle.selector, cssText);
			}
		}

		document.body.removeChild(emptyDiv);
	}

	function exportChanges(changes) {

	}

	function defaultStyleValue(settingName, defaultStyle) {
		var value = defaultStyle[settingName];
		if (!value) {
			var mapDefaults = {
				"background": "transparent none repeat scroll",
				"border-width": "0px",
				"border-style": "none",
				"border-color": "transparent",
				"border-top": "0px none transparent",
				"border-bottom": "0px none transparent",
				"border-left": "0px none transparent",
				"border-right": "0px none transparent",
				"border": "0px none transparent",
				"padding": "0px",
				"margin": "0px"
			};
			value = mapDefaults[settingName] || "";
		}
		return value;
	}

	stylemContainer = $("<div class=\"stylesDiv\"></div>").appendTo($("body"));

	for (var ss = 0; ss < document.styleSheets.length; ss++) {
		if (!document.styleSheets[ss].cssRules || !document.styleSheets[ss].cssRules.length)
			continue;
		if (ignoreThisCss(document.styleSheets[ss].href))
			continue;

		pageStyleSheets.push(new StyleSheetObject(stylemContainer, document.styleSheets[ss]));
	}

	function StyleSheetObject(styleContainer, styleSheet) {
		this.styleContainer = styleContainer;
		this.id = "";
		this.styleSheet = styleSheet;
		this.cssRules = [];
		this.changedRules = {};

		var ssId = this.styleSheet.id || shortId(this.styleSheet.href) || "styleSheet " + ss;
		this.id = ssId;
		this.itemElem = $("<div class=\"styleSheetDiv\" title=\"" + ssId + "\">" + ssId + "</div>").appendTo(styleContainer);
		this.containerElem = $("<div style=\"display:none;\"></div>").appendTo(this.itemElem);
		this.itemElem.click(toggleStyleInfo);

		for (var cr = 0; cr < this.styleSheet.cssRules.length; cr++) {
			if (!this.styleSheet.cssRules[cr].selectorText)
				continue;

			this.cssRules.push(new CssRuleObject(this, this.styleSheet.cssRules[cr]));
		}
	}

	StyleSheetObject.prototype.registerChange = function (cssRule) {
		if (hasProperties(cssRule.removedStyles) || hasProperties(cssRule.linkedStyles))
			this.changedRules[cssRule.selector] = cssRule;
		else
			delete this.changedRules[cssRule.selector];

		registerStyleChanges();
	};

	function CssRuleObject(parentSS, rule) {
		this.selector = "";
		this.cssText = "";
		this.styleSheet = parentSS;
		this.cssRule = rule;
		this.styles = [];
		this.removedStyles = {};
		this.linkedStyles = {};

		this.selector = this.cssRule.selectorText;
		this.cssText = this.cssRule.cssText;
		var openBr = this.cssText.indexOf("{");
		var closeBr = this.cssText.indexOf("}");
		this.cssText = this.cssText.substring(openBr + 1, closeBr);
		this.itemElem = $("<div class=\"cssRuleDiv\" title=\"" + this.selector + "\">" + this.selector + "</div>").appendTo(parentSS.containerElem);
		this.checker = window.setInterval(function (rule) {
			if (!rule.styleSheet.containerElem[0].offsetHeight)
				return;
			var elems = $(rule.selector);
			if (rule.applied) {
				if (elems.length == 0) {
					rule.applied = false;
					rule.itemElem.removeClass("cssRuleApplied");
				}
			} else {
				if (elems.length > 0) {
					rule.applied = true;
					rule.itemElem.addClass("cssRuleApplied");
				}
			}
		}, 500, this);

		this.contentElem = $("<div class=\"classBody\" style=\"display:none;\"></div>").appendTo(this.itemElem);
		this.itemElem.click(toggleStyleInfo);

		var settings = this.cssText.split(";");
		for (var i = 0; i < settings.length; i++) {
			if (!settings[i] || !settings[i].trim())
				continue;

			var indexOfColon = settings[i].indexOf(":");
			if (indexOfColon < 0)
				continue;
			var name = settings[i].substring(0, indexOfColon);
			var value = settings[i].substring(indexOfColon + 1);

			this.styles.push(new StyleSettingObject(name.trim(), value.trim(), this));
		}
	}

	CssRuleObject.prototype.registerChange = function (setting) {
		if (setting.removed)
			this.removedStyles[setting.name] = true;
		else
			delete this.removedStyles[setting.name];

		if (setting.link)
			this.linkedStyles[setting.name] = setting.link;
		else
			delete this.linkedStyles[setting.name];

		this.styleSheet.registerChange(this);
	};

	CssRuleObject.prototype.clearChange = function (setting) {
		delete this.removedStyles[setting.name];
		delete this.linkedStyles[setting.name];
		this.styleSheet.registerChange(this);
	};

	function StyleSettingObject(name, value, parentRule) {
		this.name = name;
		this.value = value;
		this.rule = parentRule;
		this.removed = false;
		this.link = "";

		this.containerElem = $("<div class=\"styleContainer\"></div>").appendTo(this.rule.contentElem);
		this.xElem = $("<span class=\"xBtn\">x</span>").appendTo(this.containerElem);
		var $this = this;
		this.xElem.click(function (evt) {
			var thisItem = $(this);
			thisItem.toggleClass("xBtnApplied");
			if (thisItem.hasClass("xBtnApplied")) {
				$this.sElem.removeClass("sBtnApplied");
				$this.settingElem.addClass("styleSettingRemoved");
				$this.registerChange(
					{
						removed: true,
						link: ""
					});
			}
			else {
				$this.settingElem.removeClass("styleSettingRemoved");
				$this.registerChange(
					{
						removed: false
					});
			}
		});

		this.sElem = $("<span class=\"sBtn\">s</span>").appendTo(this.containerElem);
		this.sElem.click(function (evt) {
			var thisItem = $(this);
			if (thisItem.hasClass("sBtnApplied")) {
				thisItem.removeClass("sBtnApplied");
				$this.settingElem.removeClass("styleSettingRemoved");
				$this.registerChange(
					{
						link: ""
					});
			}
			else {
				$this.addLink();
			}
		});
		this.settingElem = $("<span class=\"styleSetting\">" +
			"<span class=\"styleName\">" + this.name + "</span><span>: </span>" +
			"<span class=\"styleValue\">" + this.value + "</span><span>;</span>" +
			"</span>").appendTo(this.containerElem);
	};

	StyleSettingObject.prototype.registerChange = function (change) {
		if (typeof change.removed != "undefined") {
			this.removed = change.removed;
		}
		if (typeof change.link != "undefined") {
			this.link = change.link;
		}
		if (this.removed || this.link) {
			this.rule.registerChange(this);
		}
		else {
			this.rule.clearChange(this);
		}
	};

	StyleSettingObject.prototype.addLink = function () {
		var $this = this;
		selectLinkDialog(this, function (link) {
			$this.sElem.addClass("sBtnApplied");
			$this.xElem.removeClass("xBtnApplied");
			$this.settingElem.addClass("styleSettingRemoved");
			$this.registerChange(
				{
					removed: false,
					link: link
				});
		});
	};

	var chooseLinkDialog = null;
	function selectLinkDialog(setting, success) {
		if (!chooseLinkDialog) {
			chooseLinkDialog = new ChooseLinkDialog();
		}
		chooseLinkDialog.successCallback = success;
		chooseLinkDialog.showFor(setting);
	}

	function ChooseLinkDialog() {
		var $this = this;
		this.dialog = $("<div class=\"chooseLinkDiv\"></div>").appendTo(stylemContainer);

		var div = $("<div></div>").appendTo(this.dialog);

		this.ssSelect = $("<select class=\"styleSheetSelect\" size=\"1\"><option></option></select>").appendTo(div);
		for (var ss = 0; ss < document.styleSheets.length; ss++) {
			if (!document.styleSheets[ss].cssRules || !document.styleSheets[ss].cssRules.length)
				continue;
			var ssName = (document.styleSheets[ss].id || shortId(document.styleSheets[ss].href) || "styleSheet " + ss);
			$("<option value=\"" + ssName + "\">" + ssName + "</option>").appendTo(this.ssSelect);
		}

		div = $("<div></div>").appendTo(this.dialog);

		this.okBtn = $("<button>OK</button>").appendTo(div);
		this.okBtn.click(function () {
			var link = "";
			if ($this.successCallback /*&& link*/)
				$this.successCallback(link);
			$this.dialog.hide();
		});

		this.cancelBtn = $("<button>Cancel</button>").appendTo(div);
		this.cancelBtn.click(function () {
			$this.dialog.hide();
		});
	}

	ChooseLinkDialog.prototype.showFor = function (setting) {
		this.dialog.show();
		var settingOffset = setting.settingElem.offset();
		this.dialog.offset({ left: settingOffset.left, top: settingOffset.top + setting.settingElem.height() });
	}
});
