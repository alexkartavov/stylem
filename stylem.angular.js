var stylem = angular.module('stylem', []);

stylem.controller('stylemCtrl', function ($scope) {

	// ignoring known css files like our own and bootstrap
	$scope.ignoreCssFiles = ["stylem.css", "bootstrap.css"];
	$scope.ignoreThisCss = function (href) {
		if (!href)
			return false;
		for (var i = 0; i < this.ignoreCssFiles.length; i++) {
			if (href.substring(href.length - this.ignoreCssFiles[i].length) == this.ignoreCssFiles[i])
				return true;
		}
		return false;
	}

	// style sheets collection
	$scope.styleSheets = [];
	for (var ss = 0; ss < document.styleSheets.length; ss++) {
		if (!document.styleSheets[ss].cssRules || !document.styleSheets[ss].cssRules.length)
			continue;
		if ($scope.ignoreThisCss(document.styleSheets[ss].href))
			continue;

		$scope.styleSheets.push(new stylem.StyleSheetObject(document.styleSheets[ss]));
	}

	$scope.toggleStyleInfo = function (evt) {
		this.ss.fillInRules();
		$(evt.currentTarget).children(".styleSheetBody").toggle();
		evt.stopPropagation();
	}

	$scope.initCssRuleObj = function () {
	}

	$scope.toggleRuleInfo = function (evt) {
		this.cssRule.fillInSettings();
		$(evt.currentTarget).children(".classBody").toggle();
		evt.stopPropagation();
	}

});

stylem.directive('stylemPanel', function () {
	return {
		restrict: 'E',
		templateUrl: 'stylem.panel.html'
	};
});

stylem.StyleSheetObject = function (styleSheet) {
	this.idLength = 20;
	this.id = "";
	this.styleSheet = styleSheet;
	this.cssRules = [];
	this.changedRules = {};

	var ssId = this.styleSheet.id || this.shortId(this.styleSheet.href) || "<style>";
	this.id = ssId;
};

stylem.StyleSheetObject.prototype.registerChange = function (cssRule) {
	if (hasProperties(cssRule.removedStyles) || hasProperties(cssRule.linkedStyles) || hasProperties(cssRule.addedStyles))
		this.changedRules[cssRule.selector] = cssRule;
	else
		delete this.changedRules[cssRule.selector];

	registerStyleChanges();
};

stylem.StyleSheetObject.prototype.shortId = function (id) {
	if (id)
		return (id.length > this.idLength ? "..." : "") + id.substring(id.length - this.idLength);
	return "";
};

stylem.StyleSheetObject.prototype.fillInRules = function () {
	if (this.cssRules.length > 0)
		return;
	for (var cr = 0; cr < this.styleSheet.cssRules.length; cr++) {
		if (!this.styleSheet.cssRules[cr].selectorText)
			continue;

		this.cssRules.push(new stylem.CssRuleObject(this, this.styleSheet.cssRules[cr]));
	}
}

stylem.CssRuleObject = function (parentSS, rule) {
	var $this = this;
	this.selector = "";
	this.cssText = "";
	this.styleSheet = parentSS;
	this.cssRule = rule;
	this.styles = [];
	this.removedStyles = {};
	this.linkedStyles = {};
	this.addedStyles = {};

	this.selector = this.cssRule.selectorText;
	this.cssText = this.cssRule.cssText;
	var openBr = this.cssText.indexOf("{");
	var closeBr = this.cssText.indexOf("}");
	this.cssText = this.cssText.substring(openBr + 1, closeBr);

	//this.itemElem = $("<div class=\"cssRuleDiv\" title=\"" + this.selector + "\">" + this.selector + "</div>").appendTo(parentSS.containerElem);
	this.checker = window.setInterval(function (rule) {
		/*if (!rule.styleSheet.containerElem[0].offsetHeight)
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
		}*/
	}, 500, this);

	//this.contentElem = $("<div class=\"classBody\" style=\"display:none;\"></div>").appendTo(this.itemElem);
	//this.containerElem = $("<div></div>").appendTo(this.contentElem);
	//this.itemElem.click(toggleStyleInfo);


	//this.addStyleName = $("<input class=\"styleInput\">").appendTo(this.contentElem);
	//$("<span>:</span>").appendTo(this.contentElem);
	//this.addStyleValue = $("<input class=\"styleInput\">").appendTo(this.contentElem);
	//this.addElem = $("<span class=\"addBtn\">+</span>").appendTo(this.contentElem);
	//this.addElem.click(function (evt) {
	//	var name = $this.addStyleName.val();
	//	var value = $this.addStyleValue.val();
	//	if (name && value) {
	//		$this.styles.push(new StyleSettingObject(name, value, $this));

	//		$this.registerChange({
	//			added: true,
	//			name: name,
	//			value: value
	//		});

	//		$this.addStyleName.val("");
	//		$this.addStyleValue.val("");
	//	}
	//});
};

stylem.CssRuleObject.prototype.registerChange = function (setting) {
	if (setting.removed)
		this.removedStyles[setting.name] = true;
	else
		delete this.removedStyles[setting.name];

	if (setting.link)
		this.linkedStyles[setting.name] = setting.link;
	else
		delete this.linkedStyles[setting.name];

	if (setting.added)
		this.addedStyles[setting.name] = setting.value;

	this.styleSheet.registerChange(this);
};

stylem.CssRuleObject.prototype.clearChange = function (setting) {
	delete this.removedStyles[setting.name];
	delete this.linkedStyles[setting.name];
	this.styleSheet.registerChange(this);
};

stylem.CssRuleObject.prototype.getStyleSettings = function (cssRule) {
	if (!cssRule.cssText)
		return null;

	var cssText = cssRule.cssText;
	var openBr = cssText.indexOf("{");
	var closeBr = cssText.indexOf("}");
	cssText = cssText.substring(openBr + 1, closeBr);

	var settings = cssText.split(";");
	var styles = [];
	for (var i = 0; i < settings.length; i++) {
		if (!settings[i] || !settings[i].trim())
			continue;

		var indexOfColon = settings[i].indexOf(":");
		if (indexOfColon < 0)
			continue;
		var name = settings[i].substring(0, indexOfColon);
		var value = settings[i].substring(indexOfColon + 1);

		styles.push({ name: name.trim(), value: value.trim() });
	}
	return styles;
}

stylem.CssRuleObject.prototype.fillInSettings = function () {
	if (this.styles.length > 0)
		return;
	var settings = this.getStyleSettings(this.cssRule);
	for (var i = 0; i < settings.length; i++) {
		this.styles.push(new stylem.StyleSettingObject(settings[i].name, settings[i].value, this));
	}
};

stylem.StyleSettingObject = function (name, value, parentRule) {
	this.name = name;
	this.value = value;
	this.rule = parentRule;
	this.removed = false;
	this.link = "";

	//this.containerElem = $("<div class=\"styleContainer\"></div>").appendTo(this.rule.containerElem);
	//this.xElem = $("<span class=\"xBtn\">x</span>").appendTo(this.containerElem);
	//var $this = this;
	//this.xElem.click(function (evt) {
	//	var thisItem = $(this);
	//	thisItem.toggleClass("xBtnApplied");
	//	if (thisItem.hasClass("xBtnApplied")) {
	//		$this.sElem.removeClass("sBtnApplied");
	//		$this.settingElem.addClass("styleSettingRemoved");
	//		$this.registerChange(
	//		  {
	//		  	removed: true,
	//		  	link: ""
	//		  });
	//	}
	//	else {
	//		$this.settingElem.removeClass("styleSettingRemoved");
	//		$this.registerChange(
	//		  {
	//		  	removed: false
	//		  });
	//	}
	//});

	//this.sElem = $("<span class=\"sBtn\">s</span>").appendTo(this.containerElem);
	//this.sElem.click(function (evt) {
	//	var thisItem = $(this);
	//	if (thisItem.hasClass("sBtnApplied")) {
	//		thisItem.removeClass("sBtnApplied");
	//		$this.settingElem.removeClass("styleSettingRemoved");
	//		$this.registerChange(
	//		  {
	//		  	link: ""
	//		  });
	//	}
	//	else {
	//		$this.addLink();
	//	}
	//});
	//this.settingElem = $("<span class=\"styleSetting\">" +
	//  "<span class=\"styleName\">" + this.name + "</span><span>: </span>" +
	//  "<span class=\"styleValue\">" + this.value + "</span><span>;</span>" +
	//  "</span>").appendTo(this.containerElem);
};

stylem.StyleSettingObject.prototype.registerChange = function (change) {
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

stylem.StyleSettingObject.prototype.addLink = function () {
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
