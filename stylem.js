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

	$("<div class=\"stylesDiv\"></div>").appendTo($("body"));

	var styleDiv = $(".stylesDiv");
	var styleSheetDivs = [];

	for (var ss = 0; ss < document.styleSheets.length; ss++) {
		if (!document.styleSheets[ss].cssRules || !document.styleSheets[ss].cssRules.length)
			continue;
		if (ignoreThisCss(document.styleSheets[ss].href))
			continue;

		styleSheetDivs.push(addStyleSheetDiv(styleDiv, document.styleSheets[ss]));
	}

	function addStyleSheetDiv(styleContainer, styleSheet) {
		var ssDiv = {
			id: "",
			styleSheet: styleSheet,
			cssRules: []
		};
		var ssId = ssDiv.styleSheet.id;
		if (!ssId) {
			ssId = ssDiv.styleSheet.href;
			if (ssId) {
				ssId = (ssId.length > idLength ? "..." : "") + ssId.substring(ssId.length - idLength);
			} else {
				ssId = "styleSheet " + ss;
			}
		}
		ssDiv.id = ssId;
		ssDiv.itemElem = $("<div class=\"styleSheetDiv\" title=\"" + ssId + "\">" + ssId + "</div>").appendTo(styleContainer);
		ssDiv.containerElem = $("<div style=\"display:none;\"></div>").appendTo(ssDiv.itemElem);
		ssDiv.itemElem.click(toggleStyleInfo);

		for (var cr = 0; cr < ssDiv.styleSheet.cssRules.length; cr++) {
			if (!ssDiv.styleSheet.cssRules[cr].selectorText)
				continue;

			ssDiv.cssRules.push(addCssRule(ssDiv, ssDiv.styleSheet.cssRules[cr]));
		}
		return ssDiv;
	}

	function addCssRule(ssDiv, rule) {
		var cssRule = {
			selector: "",
			cssText: "",
			styleSheet: ssDiv,
			cssRule: rule,
			styles: []
		};
		cssRule.selector = cssRule.cssRule.selectorText;
		cssRule.cssText = cssRule.cssRule.cssText;
		var openBr = cssRule.cssText.indexOf("{");
		var closeBr = cssRule.cssText.indexOf("}");
		cssRule.cssText = cssRule.cssText.substring(openBr + 1, closeBr);
		cssRule.itemElem = $("<div class=\"cssRuleDiv\" title=\"" + cssRule.selector + "\">" + cssRule.selector + "</div>").appendTo(ssDiv.containerElem);
		cssRule.checker = window.setInterval(function (rule) {
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
		}, 500, cssRule);

		cssRule.contentElem = $("<div class=\"classBody\" style=\"display:none;\"></div>").appendTo(cssRule.itemElem);
		cssRule.itemElem.click(toggleStyleInfo);

		populateStyleSettings(cssRule);

		return cssRule;
	}

	function StyleSettingObject(name, value, parentRule) {
		this.name = name;
		this.value = value;
		this.rule = parentRule;

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
						removed: true,
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

			cssRule.styles.push(new StyleSettingObject(styleNames[0], styleNames[1], cssRule));
		}
	}

});
