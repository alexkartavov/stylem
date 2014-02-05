$(function () {

	var idLength = 20;
	var ignorCssFiles = ["stylem.css", "bootstrap.css"];

	function ignoreThisCss(href) {
		if (!href)
			return false;
		for(var i = 0; i< ignorCssFiles.length;i++){
			if (href.substring(href.length - ignorCssFiles[i].length) == ignorCssFiles[i])
				return true;
		}
		return false;
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

	var pageStyleSheets = [];
	function updateStyleSheets() {
		alert("yo, ready for updating!")
	}

	$("<div class=\"stylesDiv\"></div>").appendTo($("body"));

	var styleDiv = $(".stylesDiv");

	for (var ss = 0; ss < document.styleSheets.length; ss++) {
		if (!document.styleSheets[ss].cssRules || !document.styleSheets[ss].cssRules.length)
			continue;
		if (ignoreThisCss(document.styleSheets[ss].href))
			continue;

		pageStyleSheets.push(new StyleSheetObject(styleDiv, document.styleSheets[ss]));
	}

	function StyleSheetObject(styleContainer, styleSheet) {
		this.id = "";
		this.styleSheet = styleSheet;
		this.cssRules = [];
		this.changedRules = {};

		var ssId = this.styleSheet.id;
		if (!ssId) {
			ssId = this.styleSheet.href;
			if (ssId) {
				ssId = (ssId.length > idLength ? "..." : "") + ssId.substring(ssId.length - idLength);
			} else {
				ssId = "styleSheet " + ss;
			}
		}
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

		updateStyleSheets();
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

		populateStyleSettings(this);
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
			thisItem.toggleClass("sBtnApplied");
			if (thisItem.hasClass("sBtnApplied")) {
				$this.xElem.removeClass("xBtnApplied");
				$this.settingElem.addClass("styleSettingRemoved");
				$this.registerChange(
					{
						removed: false,
						link: $this.addLink()
					});
			}
			else {
				$this.settingElem.removeClass("styleSettingRemoved");
				$this.registerChange(
					{
						link: ""
					});
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

	StyleSettingObject.prototype.addLink = function() {

	};

	function populateStyleSettings(cssRule) {
		var settings = cssRule.cssText.split(";");
		for (var i = 0; i < settings.length; i++) {
			if (!settings[i] || !settings[i].trim())
				continue;

			var styleNames = settings[i].split(":");
			if (styleNames.length != 2)
				continue;

			cssRule.styles.push(new StyleSettingObject(styleNames[0].trim(), styleNames[1].trim(), cssRule));
		}
	}

});
