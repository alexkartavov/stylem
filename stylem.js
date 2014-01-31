$(function () {

	var idLength = 20;
	var ignorCssFiles = ["stylem.css", "bootstrap.css"];

	var ignoreThisCss = function (href) {
		if (!href)
			return false;
		for(var i = 0; i< ignorCssFiles.length;i++){
			if (href.substring(href.length - ignorCssFiles[i].length) == ignorCssFiles[i])
				return true;
		}
		return false;
	};

	var toggleStyleInfo = function (evt) {
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

		var ssDiv = {
			id: "",
			styleSheet: document.styleSheets[ss],
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
		ssDiv.itemElem = $("<div class=\"styleSheetDiv\" title=\"" + ssId + "\">" + ssId + "</div>").appendTo(styleDiv);
		ssDiv.containerElem = $("<div style=\"display:none;\"></div>").appendTo(ssDiv.itemElem);
		ssDiv.itemElem.click(toggleStyleInfo);

		for (var cr = 0; cr < ssDiv.styleSheet.cssRules.length; cr++) {
			if (!ssDiv.styleSheet.cssRules[cr].selectorText)
				continue;
			var cssRule = {
				selector: "",
				cssText: "",
				styleSheet: ssDiv,
				cssRule: ssDiv.styleSheet.cssRules[cr]
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

			cssRule.contentElem = $("<div class=\"classBody\" style=\"display:none;\">" + cssRule.cssText + "</div>").appendTo(cssRule.itemElem);
			cssRule.itemElem.click(toggleStyleInfo);

			ssDiv.cssRules.push(cssRule);
		}

		styleSheetDivs.push(ssDiv);
	}
});
